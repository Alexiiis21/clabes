"use client";

import { useEffect, useState, useRef } from "react";
import { Moon, Sun, Upload, Plus, Bot, Building2, CreditCard, User, FileText, LogOut, CheckCircle, Search, ImagePlus, X, Copy, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export default function Home() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  
  // States
  const [name, setName] = useState("");
  const [clabe, setClabe] = useState("");
  const [bank, setBank] = useState("");
  const [notes, setNotes] = useState("");
  const [rawText, setRawText] = useState("");
  const [imageStr, setImageStr] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchClients();
  }, []);

  const handleCopy = (clabe: string, id: number) => {
    navigator.clipboard.writeText(clabe);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setImageStr(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) setClients(await res.json());
    } catch(e) { /* ignore */ }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageStr(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExtractAI = async () => {
    if (!rawText && !imageStr) return;
    setLoadingAI(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        body: JSON.stringify({ text: rawText, image: imageStr }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if(data.name) setName(data.name);
      if(data.clabe) setClabe(data.clabe);
      if(data.bank) setBank(data.bank);
      if(data.notes) setNotes(data.notes);
    } catch (e) {
      alert("Error procesando IA. Verifica tu API Key o los límites.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!name || !clabe) return alert("Nombre y CLABE son requeridos");
    
    await fetch("/api/clients", {
      method: "POST",
      body: JSON.stringify({ name, clabe, bank, notes }),
      headers: { "Content-Type": "application/json" }
    });
    
    setName(""); setClabe(""); setBank(""); setNotes(""); setRawText(""); setImageStr(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    fetchClients();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.clabe.includes(searchQuery)
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 sm:p-3 rounded-xl text-white shadow-sm shadow-blue-500/20">
              <CreditCard size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Clabes</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button
              onClick={handleLogout}
              className="p-2 sm:p-2.5 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 text-gray-600 dark:text-gray-300 transition-colors flex items-center gap-2"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline text-sm font-medium">Salir</span>
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6 sm:gap-8">
          {/* Panel Lateral - Formulario e IA */}
          <div className="space-y-6 flex flex-col">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/30">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold mb-3 text-sm uppercase tracking-wider">
                <Bot size={18} /> Autofill
              </div>
              
              <div className="space-y-3">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="Pega texto o una imagen aquí... Ej: 'La cuenta es 0123...'"
                  className="w-full h-24 p-3 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all dark:placeholder-gray-500"
                />

                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    ref={fileInputRef}
                    className="hidden" 
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="flex items-center justify-center gap-2 w-full py-2 px-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm text-gray-600 dark:text-gray-300">
                    <ImagePlus size={16} />
                    {imageStr ? "Cambiar Imagen" : "Subir Captura o Foto"}
                  </label>
                  {imageStr && (
                    <div className="mt-2 relative inline-block">
                      <img src={imageStr} alt="Preview" className="h-16 rounded-md border border-gray-200 dark:border-gray-700" />
                      <button 
                        onClick={() => { setImageStr(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleExtractAI}
                  disabled={loadingAI || (!rawText && !imageStr)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
                >
                  {loadingAI ? "Procesando con IA..." : "Extraer Datos"}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm flex-1 flex flex-col">
              <h2 className="font-semibold text-lg border-b border-gray-100 dark:border-gray-700 pb-3 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-gray-400" /> Nuevo Registro
              </h2>
              
              <div className="space-y-4 flex-1">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block ml-1">Nombre Completo</label>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl px-3 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                    <User size={18} className="text-gray-400" />
                    <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full bg-transparent p-2.5 outline-none text-sm" />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block ml-1">Cuenta CLABE (18 dígitos)</label>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl px-3 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                    <CreditCard size={18} className="text-gray-400" />
                    <input required value={clabe} onChange={e=>setClabe(e.target.value)} placeholder="012xxxxxxxxxxxxxxx" className="w-full font-mono text-sm bg-transparent p-2.5 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block ml-1">Banco (Opcional)</label>
                  <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl px-3 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                    <Building2 size={18} className="text-gray-400" />
                    <input value={bank} onChange={e=>setBank(e.target.value)} placeholder="Ej. BBVA" className="w-full bg-transparent p-2.5 outline-none text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 block ml-1">Notas Extras</label>
                  <div className="flex items-start bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                    <FileText size={18} className="text-gray-400 mt-1" />
                    <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Concepto, contacto..." className="w-full bg-transparent px-2.5 outline-none resize-none text-sm h-16" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
                Guardar Cliente
              </button>
            </form>
          </div>

          {/* Panel Principal - Lista de Clientes */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full lg:min-h-[600px]">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Building2 size={20} className="text-blue-500" /> Directorio 
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">
                  {filteredClients.length}
                </span>
              </div>
              
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar nombre o CLABE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-gray-500 dark:text-gray-400 text-xs bg-gray-50 dark:bg-gray-800/80 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Titular</th>
                    <th className="px-6 py-4 font-medium">Banco</th>
                    <th className="px-6 py-4 font-medium">Info Cuenta</th>
                    <th className="px-6 py-4 font-medium">Alta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-16 text-gray-400 text-sm">
                        <div className="flex flex-col items-center gap-2">
                          <Bot size={32} className="opacity-20 mb-2" />
                          <p>{clients.length === 0 ? "Base de datos vacía." : "Ningún cliente coincide con la búsqueda."}</p>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                  {filteredClients.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{c.name}</div>
                        {c.notes && <div className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">{c.notes}</div>}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {c.bank ? (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                            {c.bank}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 select-all tracking-wider text-blue-600 dark:text-blue-400">
                            {c.clabe}
                          </div>
                          <button
                            onClick={() => handleCopy(c.clabe, c.id)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Copiar CLABE"
                          >
                            {copiedId === c.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
