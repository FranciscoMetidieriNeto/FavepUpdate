-- CreateTable
CREATE TABLE "usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "fotoperfil" TEXT,
    "senha" TEXT NOT NULL,
    "emailVerified" BOOLEAN DEFAULT false,
    "verificationToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" DATETIME
);

-- CreateTable
CREATE TABLE "propriedade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomepropriedade" TEXT NOT NULL,
    "localizacao" TEXT,
    "usuarioId" TEXT NOT NULL,
    "area_ha" INTEGER,
    CONSTRAINT "propriedade_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "producao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "safra" TEXT NOT NULL,
    "areaproducao" REAL NOT NULL,
    "data" DATETIME NOT NULL,
    "cultura" TEXT NOT NULL,
    "produtividade" REAL NOT NULL,
    "propriedadeId" TEXT NOT NULL,
    CONSTRAINT "producao_propriedadeId_fkey" FOREIGN KEY ("propriedadeId") REFERENCES "propriedade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "financeiro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL,
    "propriedadeId" TEXT NOT NULL,
    CONSTRAINT "financeiro_propriedadeId_fkey" FOREIGN KEY ("propriedadeId") REFERENCES "propriedade" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "planos_mercado_pago" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "dataAssinatura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodoPagamento" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "idAssinaturaExterna" TEXT,
    CONSTRAINT "planos_mercado_pago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_telefone_key" ON "usuario"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_verificationToken_key" ON "usuario"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_resetPasswordToken_key" ON "usuario"("resetPasswordToken");

-- CreateIndex
CREATE UNIQUE INDEX "planos_mercado_pago_idAssinaturaExterna_key" ON "planos_mercado_pago"("idAssinaturaExterna");
