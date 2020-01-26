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
            AND tablename NOT LIKE '%_role')
    LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END
$$;
