import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { LoginAttempt, User } from "@/types/auth";

const Admin = () => {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);

  useEffect(() => {
    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel('login_attempts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'login_attempts' },
        (payload) => {
          toast.info("Nova tentativa de login detectada!");
          setLoginAttempts(prev => [payload.new as LoginAttempt, ...prev]);
        }
      )
      .subscribe();

    // Carregar tentativas de login existentes
    loadLoginAttempts();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLoginAttempts = async () => {
    const { data, error } = await supabase
      .from('login_attempts')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      toast.error("Erro ao carregar tentativas de login");
      return;
    }

    setLoginAttempts(data);
  };

  const handleBlock = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .upsert({ userId, blocked: true });

      if (error) throw error;

      toast.success("Usuário bloqueado com sucesso!");
    } catch (error) {
      toast.error("Erro ao bloquear usuário");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-light p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-8">Painel de Administração</h1>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Tentativas de Login Recentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Data/Hora</th>
                  <th className="px-4 py-2 text-left">Usuário</th>
                  <th className="px-4 py-2 text-left">IP</th>
                  <th className="px-4 py-2 text-left">Dispositivo</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loginAttempts.map((attempt) => (
                  <tr key={attempt.timestamp} className="border-b">
                    <td className="px-4 py-2">
                      {new Date(attempt.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{attempt.userId}</td>
                    <td className="px-4 py-2">{attempt.ipAddress}</td>
                    <td className="px-4 py-2">{attempt.deviceInfo}</td>
                    <td className="px-4 py-2">
                      {attempt.success ? (
                        <span className="text-green-500">Sucesso</span>
                      ) : (
                        <span className="text-red-500">Falha</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleBlock(attempt.userId)}
                      >
                        Bloquear
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;