import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";
import { DEFAULT_PRIZES } from "@/lib/validations";

export async function GET() {
  try {
    await initDb();
    const sql = getDb();
    const rows = await sql`
      SELECT id, name, active, probability, color, created_at as "createdAt"
      FROM wheel_prizes
      ORDER BY created_at ASC;
    `;

    // Se o banco estiver vazio pela primeira vez, povoa com os prêmios padrão
    if (rows.length === 0) {
      for (const p of DEFAULT_PRIZES as any[]) {
        await sql`
          INSERT INTO wheel_prizes (id, name, active, probability, color, created_at)
          VALUES (${p.id}, ${p.name}, ${p.active}, ${p.probability ?? null}, ${p.color ?? null}, ${p.createdAt})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
      return NextResponse.json({ prizes: DEFAULT_PRIZES });
    }

    const prizes = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      active: Boolean(r.active),
      probability: r.probability !== null ? Number(r.probability) : undefined,
      color: r.color || undefined,
      createdAt: Number(r.createdAt),
    }));

    return NextResponse.json({ prizes });
  } catch (error: any) {
    console.error("Erro ao buscar prêmios no Neon:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const sql = getDb();
    const body = await request.json();
    const { name, probability } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Nome do prêmio é obrigatório" }, { status: 400 });
    }

    const id = `prize-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = Date.now();
    const probNum = probability !== undefined && probability !== "" ? Number(probability) : null;

    await sql`
      INSERT INTO wheel_prizes (id, name, active, probability, created_at)
      VALUES (${id}, ${name.trim()}, TRUE, ${probNum}, ${createdAt});
    `;

    return NextResponse.json({
      prize: {
        id,
        name: name.trim(),
        active: true,
        probability: probNum !== null ? probNum : undefined,
        createdAt,
      },
    });
  } catch (error: any) {
    console.error("Erro ao adicionar prêmio no Neon:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    await initDb();
    const sql = getDb();
    await sql`
      DELETE FROM wheel_prizes WHERE id = ${id};
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir prêmio no Neon:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, probability, active } = body;

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await initDb();
    const sql = getDb();

    if (active !== undefined && name === undefined && probability === undefined) {
      await sql`
        UPDATE wheel_prizes
        SET active = ${Boolean(active)}
        WHERE id = ${id};
      `;
    } else {
      const probNum = probability !== undefined && probability !== "" ? Number(probability) : null;
      await sql`
        UPDATE wheel_prizes
        SET name = COALESCE(${name ? name.trim() : null}, name),
            probability = ${probNum},
            active = COALESCE(${active !== undefined ? Boolean(active) : null}, active)
        WHERE id = ${id};
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao atualizar prêmio no Neon:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
