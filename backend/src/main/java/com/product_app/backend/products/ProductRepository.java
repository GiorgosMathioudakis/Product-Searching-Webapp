package com.product_app.backend.products;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Objects;

@Repository
public class ProductRepository{
    private final NamedParameterJdbcTemplate jdbc;

    public ProductRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final RowMapper<ProductDto> ROW_MAPPER = new RowMapper<>() {
        @Override
        public ProductDto mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new ProductDto(
                    rs.getLong("id"),
                    rs.getString("sku"),
                    rs.getString("name"),
                    rs.getString("description"),
                    rs.getBigDecimal("price"),
                    rs.getObject("created_at", OffsetDateTime.class),
                    rs.getObject("updated_at", OffsetDateTime.class)
            );
        }
    };

    public List<ProductDto> list(
            int limit,
            SortField sortField,
            SortDir dir,
            String nameQ,
            String skuQ,
            // keyset parameters (null for first page)
            BigDecimal afterBigDecimal,  // for name
            OffsetDateTime afterTime, // for created/updated
            Long afterId
    ) {
        // Build WHERE
        StringBuilder where = new StringBuilder(" WHERE 1=1 ");
        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("limit", limit + 1); // fetch one extra to know if there's another page

        if (nameQ != null && !nameQ.isBlank()) {
            where.append(" AND name ILIKE :nameQ ");
            params.addValue("nameQ", "%" + nameQ + "%");
        }
        if (skuQ != null && !skuQ.isBlank()) {
            where.append(" AND sku ILIKE :skuQ ");
            params.addValue("skuQ", "%" + skuQ + "%");
        }

        // Keyset predicate based on sort/direction
        String orderDir = dir == SortDir.ASC ? "ASC" : "DESC";
        String cmp = dir == SortDir.ASC ? ">" : "<";

        String orderBy;
        String keyset;
        switch (sortField) {
            case PRICE -> {
                orderBy = " ORDER BY price " + orderDir + ", id " + orderDir + " ";
                if (afterBigDecimal != null && afterId != null) {
                    keyset = " AND (price " + cmp + " :afterBigDecimal OR (price = :afterBigDecimal AND id " + cmp + " :afterId)) ";
                    params.addValue("afterBigDecimal", afterBigDecimal);
                    params.addValue("afterId", afterId);
                } else keyset = "";
            }
            case UPDATED_AT -> {
                orderBy = " ORDER BY updated_at " + orderDir + ", id " + orderDir + " ";
                if (afterTime != null && afterId != null) {
                    keyset = " AND (updated_at " + cmp + " :afterTime OR (updated_at = :afterTime AND id " + cmp + " :afterId)) ";
                    params.addValue("afterTime", afterTime);
                    params.addValue("afterId", afterId);
                } else keyset = "";
            }
            case CREATED_AT -> {
                orderBy = " ORDER BY created_at " + orderDir + ", id " + orderDir + " ";
                if (afterTime != null && afterId != null) {
                    keyset = " AND (created_at " + cmp + " :afterTime OR (created_at = :afterTime AND id " + cmp + " :afterId)) ";
                    params.addValue("afterTime", afterTime);
                    params.addValue("afterId", afterId);
                } else keyset = "";
            }
            default -> throw new IllegalArgumentException("Unsupported sort field");
        }

        String sql = """
                SELECT id, sku, name, description, price, created_at, updated_at
                FROM products
                """ + where + keyset + orderBy + """
                LIMIT :limit
                """;

        return jdbc.query(sql, params, ROW_MAPPER);
    }

    public enum SortField { PRICE, CREATED_AT, UPDATED_AT }
    public enum SortDir { ASC, DESC }

    public static SortField parseSortField(String raw) {
        if (raw == null) return SortField.CREATED_AT;
        return switch (raw.toLowerCase()) {
            case "price" -> SortField.PRICE;
            case "updated_at" -> SortField.UPDATED_AT;
            case "created_at" -> SortField.CREATED_AT;
            default -> SortField.CREATED_AT;
        };
    }

    public static SortDir parseSortDir(String raw) {
        if (raw == null) return SortDir.DESC;
        return Objects.equals(raw.toLowerCase(), "asc") ? SortDir.ASC : SortDir.DESC;
    }
}