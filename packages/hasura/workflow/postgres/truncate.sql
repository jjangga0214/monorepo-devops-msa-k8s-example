DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT
            tablename
        FROM
            pg_tables
        WHERE
            schemaname = 'public'
            AND tablename NOT IN (
                SELECT
                    table_name
                FROM (
                    SELECT
                        table_name,
                        count(column_name) AS colume_count
                    FROM
                        information_schema.columns
                    WHERE
                        table_schema = 'public'
                        AND table_name IN (
                            SELECT
                                table_name
                            FROM (
                                SELECT
                                    table_name,
                                    count(column_name) AS colume_count
                                FROM
                                    information_schema.columns
                                WHERE
                                    table_schema = 'public'
                                GROUP BY
                                    table_name) tmp_0
                            WHERE
                                colume_count <= 2)
                            AND (column_name = 'value'
                                OR column_name = 'comment')
                            AND data_type = 'text'
                        GROUP BY
                            table_name
                        ORDER BY
                            table_name) tmp_0
                    WHERE
                        colume_count <= 2))
            LOOP
                EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;
END
$$;
