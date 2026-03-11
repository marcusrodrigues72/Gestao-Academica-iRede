"use client";

import * as React from "react";
import { Sidebar, TopBar } from "@/components/layout-components";
import { 
  Settings, 
  User, 
  Shield, 
  Database,
  Bell,
  Palette
} from "lucide-react";
import { motion } from "motion/react";

export default function ConfiguracoesPage() {
  const sections = [
    { icon: User, label: "Perfil", desc: "Gerencie suas informações pessoais e avatar." },
    { icon: Shield, label: "Segurança", desc: "Altere sua senha e configurações de acesso." },
    { icon: Bell, label: "Notificações", desc: "Escolha como deseja ser alertado sobre eventos." },
    { icon: Database, label: "Dados", desc: "Backup e exportação de dados do sistema." },
    { icon: Palette, label: "Aparência", desc: "Personalize as cores e o tema da interface." },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Configurações do Sistema" subtitle="Personalize sua experiência e gerencie acessos." />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="grid grid-cols-1 gap-4">
              {sections.map((section, i) => (
                <motion.div
                  key={section.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-center gap-6 cursor-pointer"
                >
                  <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white rounded-2xl transition-all">
                    <section.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 tracking-tight">{section.label}</h4>
                    <p className="text-xs text-slate-500 font-medium">{section.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <Settings className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
