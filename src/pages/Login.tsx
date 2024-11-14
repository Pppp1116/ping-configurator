import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      };

      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (user) {
        // Registrar tentativa de login
        const { error: loginError } = await supabase
          .from('login_attempts')
          .insert({
            userId: user.id,
            timestamp: new Date().toISOString(),
            ipAddress: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip),
            deviceInfo: JSON.stringify(deviceInfo),
            success: true
          });

        if (loginError) throw loginError;

        // Verificar se usuário está bloqueado
        const { data: blockedData, error: blockedError } = await supabase
          .from('blocked_users')
          .select('blocked')
          .eq('userId', user.id)
          .single();

        if (blockedError) throw blockedError;

        if (blockedData?.blocked) {
          toast.error("Sua conta foi bloqueada. Entre em contato com o administrador.");
          return;
        }

        toast.success("Login realizado com sucesso!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary to-primary-light p-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Login</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;