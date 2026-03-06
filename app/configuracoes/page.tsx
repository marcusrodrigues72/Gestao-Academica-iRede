'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  Settings, 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Database, 
  ShieldCheck, 
  ChevronRight,
  Save,
  UserCog
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserManagement } from '@/components/user-management';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('Perfil Geral');
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        }
      });
  }, []);

  const tabs = [
    { label: 'Perfil Geral', icon: User },
    { label: 'Gestão de Usuários', icon: UserCog, roles: ['administrador', 'gestor'] },
    { label: 'Notificações', icon: Bell },
    { label: 'Segurança', icon: Lock },
    { label: 'Idioma & Região', icon: Globe },
    { label: 'Banco de Dados', icon: Database },
  ];

  const filteredTabs = tabs.filter(tab => !tab.roles || (user && tab.roles.includes(user.role)));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Configurações do Sistema" 
          subtitle="Ajuste as preferências globais e segurança da plataforma" 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Settings Navigation */}
              <aside className="lg:col-span-4 space-y-4">
                {filteredTabs.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.label)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                      activeTab === item.label 
                        ? "bg-white text-primary shadow-sm border border-slate-200" 
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {activeTab === item.label && <ChevronRight className="ml-auto w-4 h-4" />}
                  </button>
                ))}
              </aside>

              {/* Settings Content Area */}
              <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
                {activeTab === 'Perfil Geral' && (
                  <>
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-4 bg-primary/5 rounded-2xl">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Configurações de Perfil</h3>
                        <p className="text-xs text-slate-500">Gerencie as informações básicas da sua conta administrativa</p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                          <input 
                            type="text" 
                            defaultValue="Alex Thompson" 
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Corporativo</label>
                          <input 
                            type="email" 
                            defaultValue="alex.t@irede.edu.br" 
                            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio Curta</label>
                        <textarea 
                          rows={4}
                          defaultValue="Administrador sênior com foco em gestão acadêmica e inovação tecnológica na iRede EDU." 
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        />
                      </div>
                    </div>

                    <div className="pt-10 border-t border-slate-100 flex justify-end gap-4">
                      <button className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                        Descartar
                      </button>
                      <button className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" /> Salvar Alterações
                      </button>
                    </div>
                  </>
                )}

                {activeTab === 'Gestão de Usuários' && (
                  <>
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-4 bg-primary/5 rounded-2xl">
                        <UserCog className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Gestão de Usuários</h3>
                        <p className="text-xs text-slate-500">Controle de acesso e permissões do sistema</p>
                      </div>
                    </div>
                    <UserManagement />
                  </>
                )}

                {activeTab !== 'Perfil Geral' && activeTab !== 'Gestão de Usuários' && (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <Settings className="w-10 h-10 text-slate-200 animate-pulse" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Esta seção de configurações está em desenvolvimento.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
