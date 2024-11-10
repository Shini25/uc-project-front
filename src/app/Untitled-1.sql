postgres //

CREATE USER workuser WITH PASSWORD 'WorkPassword16914^)!$';

creation interactive : 
createuser --interactive -P

psql

GRANT ALL PRIVILEGES ON stage_finance TO workuser;

specification de la base donnees
\c stage_finance

GRANT CREATE, USAGE ON SCHEMA public TO workuser;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO workuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO workuser;

CONFIGURATION
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO workuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO workuser;

