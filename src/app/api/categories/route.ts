import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function getCurrentFinancialYear() {
  const now = new Date();
  const y = now.getFullYear();
  return `${y.toString().slice(-2)}${(y + 1).toString().slice(-2)}`;
}

function generateCode(prefix: string, existingCodes: string[]): string {
  const fy = getCurrentFinancialYear();
  let max = 0;
  existingCodes.forEach(code => {
    if (code?.startsWith(prefix)) {
      const num = parseInt(code.replace(prefix, '').slice(0, 5), 10);
      if (!isNaN(num) && num > max) max = num;
    }
  });
  const next = (max + 1).toString().padStart(5, '0');
  return `${prefix}${next}${fy}`;
}

// GET /api/categories
export async function GET() {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('[GET /api/categories]', err);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/categories — add main, sub, or subsub category
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, name, prefix, parentMain, subName, parentSub, subSubName } = body;

    if (type === 'main') {
      const { data: existing } = await supabase.from('categories').select('document');
      const codes = (existing || []).map((r: any) => r.document?.code || '');
      const code = generateCode(prefix.toUpperCase(), codes);

      const { data, error } = await supabase
        .from('categories')
        .insert([{ id: name, document: { code, subcategories: {} } }])
        .select().single();

      if (error) throw error;
      return NextResponse.json({ id: data.id, ...data.document }, { status: 201 });

    } else if (type === 'sub') {
      const { data: parent, error: fetchErr } = await supabase
        .from('categories').select('*').eq('id', parentMain).single();
      if (fetchErr || !parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 });

      const doc = parent.document || {};
      doc.subcategories = doc.subcategories || {};
      doc.subcategories[subName] = { items: [] };

      const { error } = await supabase.from('categories').update({ document: doc }).eq('id', parentMain);
      if (error) throw error;
      return NextResponse.json({ ok: true }, { status: 201 });

    } else if (type === 'subsub') {
      const { data: parent, error: fetchErr } = await supabase
        .from('categories').select('*').eq('id', parentMain).single();
      if (fetchErr || !parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 });

      const doc = parent.document || {};
      const sub = doc.subcategories?.[parentSub];
      if (!sub) return NextResponse.json({ error: 'Sub-category not found' }, { status: 404 });

      sub.items = sub.items || [];
      if (!sub.items.includes(subSubName)) sub.items.push(subSubName);

      const { error } = await supabase.from('categories').update({ document: doc }).eq('id', parentMain);
      if (error) throw error;
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/categories]', err);
    return NextResponse.json({ error: 'Failed to save category' }, { status: 500 });
  }
}

// DELETE /api/categories?id=mainName&type=main&sub=subName&subsub=subSubName
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') || 'main';
    const sub = searchParams.get('sub');
    const subsub = searchParams.get('subsub');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    if (type === 'main') {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    } else {
      const { data: parent, error: fetchErr } = await supabase
        .from('categories').select('*').eq('id', id).single();
      if (fetchErr || !parent) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const doc = parent.document || {};

      if (type === 'sub' && sub) {
        delete doc.subcategories?.[sub];
      } else if (type === 'subsub' && sub && subsub) {
        const subCat = doc.subcategories?.[sub];
        if (subCat) {
          subCat.items = (subCat.items || []).filter((i: string) => i !== subsub);
        }
      }

      const { error } = await supabase.from('categories').update({ document: doc }).eq('id', id);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/categories]', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

// PUT /api/categories — rename/update a category node
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { type, oldName, newName, parentMain, parentSub, prefix } = body;

    if (type === 'main') {
      const { data: parent } = await supabase.from('categories').select('*').eq('id', oldName).single();
      if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const doc = parent.document || {};
      if (newName !== oldName) {
        await supabase.from('categories').delete().eq('id', oldName);
        await supabase.from('categories').insert([{ id: newName, document: doc }]);
      } else {
        await supabase.from('categories').update({ document: doc }).eq('id', oldName);
      }
    } else if (type === 'sub') {
      const { data: parent } = await supabase.from('categories').select('*').eq('id', parentMain).single();
      if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const doc = parent.document || {};
      const subData = doc.subcategories?.[oldName];
      if (!subData) return NextResponse.json({ error: 'Sub not found' }, { status: 404 });
      if (newName !== oldName) {
        delete doc.subcategories[oldName];
        doc.subcategories[newName] = subData;
      }
      await supabase.from('categories').update({ document: doc }).eq('id', parentMain);
    } else if (type === 'subsub') {
      const { data: parent } = await supabase.from('categories').select('*').eq('id', parentMain).single();
      if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const doc = parent.document || {};
      const subCat = doc.subcategories?.[parentSub];
      if (!subCat) return NextResponse.json({ error: 'Sub not found' }, { status: 404 });
      subCat.items = (subCat.items || []).map((i: string) => i === oldName ? newName : i);
      await supabase.from('categories').update({ document: doc }).eq('id', parentMain);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/categories]', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
