"use client";
import { useEffect, useState, useRef } from "react";

const BANNER_POSITIONS = [
  { pos: 1, label: "Баннер 1 — левый верхний" },
  { pos: 2, label: "Баннер 2 — правый верхний" },
  { pos: 3, label: "Баннер 3 — горизонтальный центр" },
  { pos: 4, label: "Баннер 4 — нижний левый" },
  { pos: 5, label: "Баннер 5 — нижний правый" },
];

const MOBILE_BANNER_POSITIONS = [
  { pos: 6, label: "Мобильный баннер 1" },
  { pos: 7, label: "Мобильный баннер 2" },
];

interface Banner {
  id: string;
  image?: string;
  link?: string;
  images?: string[];
  links?: string[];
  active: boolean;
  position: number;
  mobileOnly: boolean;
}

export default function AdminAdsManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null); // позиция
  const [form, setForm] = useState<Partial<Banner>>({});
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    setLoading(true);
    const res = await fetch("/api/admin/ads");
    const data = await res.json();
    setBanners(data);
    setLoading(false);
  }

  function startEdit(position: number) {
    setEditing(position);
    const banner = banners.find(b => b.position === position);
    setForm(banner ? { ...banner } : { position, active: true, mobileOnly: false });
  }

  async function saveBanner(e: any) {
    e.preventDefault();
    setError("");
    const method = form.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/ads", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, position: editing }),
    });
    if (!res.ok) {
      setError("Ошибка сохранения");
      return;
    }
    await fetchBanners();
    setEditing(null);
    setForm({});
  }

  async function deleteBanner(id: string) {
    if (!confirm("Удалить баннер?")) return;
    await fetch("/api/admin/ads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchBanners();
  }

  async function handleImageUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    data.append("type", "banner");
    const res = await fetch("/api/upload", { method: "POST", body: data });
    if (!res.ok) {
      setError("Ошибка загрузки изображения");
      return;
    }
    const result = await res.json();
    setForm(f => ({ ...f, image: result.url }));
  }

  function handleChange(e: any) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Баннеры на главной</h3>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {BANNER_POSITIONS.map(({ pos, label }) => {
              const b = banners.find(b => b.position === pos && !b.mobileOnly);
              return (
                <div key={pos} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100 relative">
                  <div className="font-semibold text-base mb-1">{label}</div>
                  <div className="rounded-xl overflow-hidden mb-2 border border-gray-200 bg-gray-50" style={{minHeight: 96}}>
                    {b?.image ? (
                      <img src={b.image} alt="banner" className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center text-gray-400">Нет изображения</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 break-all mb-2">{b?.link || 'Нет ссылки'}</div>
                  <div className="flex items-center gap-2 mt-auto">
                    <span className={b?.active ? 'text-green-600' : 'text-gray-400'}>
                      {b?.active ? 'Активен' : 'Скрыт'}
                    </span>
                    <button onClick={() => startEdit(pos)} className="ml-auto px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{b ? 'Редактировать' : 'Добавить'}</button>
                    {b?.id && <button onClick={() => deleteBanner(b.id)} className="ml-2 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">Удалить</button>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Мобильные баннеры */}
          <h3 className="text-xl font-bold mb-4">Мобильные баннеры</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOBILE_BANNER_POSITIONS.map(({ pos, label }) => {
              const b = banners.find(b => b.position === pos && b.mobileOnly);
              return (
                <div key={pos} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100 relative">
                  <div className="font-semibold text-base mb-1">{label}</div>
                  <div className="rounded-xl overflow-hidden mb-2 border border-gray-200 bg-gray-50" style={{minHeight: 96}}>
                    {b?.image ? (
                      <img src={b.image} alt="banner" className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center text-gray-400">Нет изображения</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 break-all mb-2">{b?.link || 'Нет ссылки'}</div>
                  <div className="flex items-center gap-2 mt-auto">
                    <span className={b?.active ? 'text-green-600' : 'text-gray-400'}>
                      {b?.active ? 'Активен' : 'Скрыт'}
                    </span>
                    <button onClick={() => startEdit(pos)} className="ml-auto px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{b ? 'Редактировать' : 'Добавить'}</button>
                    {b?.id && <button onClick={() => deleteBanner(b.id)} className="ml-2 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">Удалить</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {/* Модалка/форма редактирования */}
      {editing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form onSubmit={saveBanner} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col gap-4 relative">
            <button type="button" onClick={() => { setEditing(null); setForm({}); }} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">✕</button>
            <h4 className="text-lg font-bold mb-2">{form.id ? 'Редактировать баннер' : 'Добавить баннер'}</h4>
            {editing === 6 ? (
              <div className="flex flex-col gap-4">
                {[0,1,2].map(i => (
                  <div key={i} className="flex flex-col gap-2 border-b pb-2">
                    <label className="font-medium">Картинка {i+1}</label>
                    {form.images?.[i] && <img src={form.images[i]} alt="preview" className="w-full h-24 object-cover rounded mb-2" />}
                    <input type="file" accept="image/*" onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = new FormData();
                      data.append("file", file);
                      data.append("type", "banner");
                      const res = await fetch("/api/upload", { method: "POST", body: data });
                      if (!res.ok) { setError("Ошибка загрузки изображения"); return; }
                      const result = await res.json();
                      const arr = form.images ? [...form.images] : ['', '', ''];
                      arr[i] = result.url;
                      setForm(f => ({ ...f, images: arr }));
                    }} className="border rounded px-3 py-2" />
                    <input type="text" placeholder="Ссылка (https://...)" value={form.links?.[i] || ''} onChange={e => {
                      const arr = form.links ? [...form.links] : ['', '', ''];
                      arr[i] = e.target.value;
                      setForm(f => ({ ...f, links: arr }));
                    }} className="border rounded px-3 py-2" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="font-medium">Картинка баннера</label>
                  {form.image && <img src={form.image} alt="preview" className="w-full h-32 object-cover rounded mb-2" />}
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="border rounded px-3 py-2" />
                </div>
                <input name="link" value={form.link || ''} onChange={handleChange} placeholder="Ссылка (https://...)" className="border rounded px-3 py-2" />
              </>
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" name="active" checked={form.active ?? true} onChange={handleChange} /> Активен
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="mobileOnly" checked={form.mobileOnly ?? false} onChange={handleChange} /> Мобильный баннер
            </label>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Сохранить</button>
          </form>
        </div>
      )}
    </div>
  );
} 