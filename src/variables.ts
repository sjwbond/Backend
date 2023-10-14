export function dataPgUser(): string { return process.env.PG_USER || "postgres"; }
export function dataPgHost(): string { return process.env.PG_HOST || "localhost"; }
export function dataPgDatabase(): string { return process.env.PG_DATABASE || "modelling04"; }
export function dataPgPassword(): string { return process.env.PG_PASSWORD || "postgres"; }
export function dataPgPort(): number { return parseInt(process.env.PG_PORT || "5432"); }
export function dataPgSsl(): boolean { return ["yes", "true"].includes(process.env.PG_SSL?.toLowerCase()); }