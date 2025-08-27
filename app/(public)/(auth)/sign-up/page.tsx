"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { IconoGitHub } from "@/components/icons/IconoGitHub";
import { IconoGoogle } from "@/components/icons/IconoGoogle";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

// --- Schema ---
const schema = z
  .object({
    name: z.string().min(2, "Nombre demasiado corto"),
    email: z.string().email("Correo inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Incluye mayúsculas")
      .regex(/[a-z]/, "Incluye minúsculas")
      .regex(/\d/, "Incluye números"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Las contraseñas no coinciden",
  });

type FormValues = z.infer<typeof schema>;

// --- Util ---
function scorePassword(s: string) {
  let score = 0;
  if (!s) return 0;
  const rules = [/\d/, /[a-z]/, /[A-Z]/, /[^\w\s]/];
  score += Math.min(6, Math.floor(s.length / 3));
  rules.forEach((r) => (score += r.test(s) ? 2 : 0));
  return Math.min(10, score);
}

export default function SignUpPage() {
  const [show, setShow] = useState({ pw: false, cpw: false });
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  const password = watch("password");
  const strength = scorePassword(password ?? "");

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    // Llama a tu endpoint /api/auth/register o similar
    try {
      console.log("register", values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-svh w-full place-items-center overflow-hidden bg-background p-4 md:grid">
      {/* fondo decorativo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-tr from-fuchsia-400/20 via-sky-300/10 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.muted/40)_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto w-full max-w-3xl">
        <Card className="overflow-hidden border-white/10 bg-card/70 backdrop-blur-xl">
          <CardContent className="grid p-0 md:grid-cols-2">
            {/* Columna izquierda: formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-10">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">Create your account</span>
                  <h1 className="text-2xl font-bold md:text-3xl">Regístrate</h1>
                  <p className="text-muted-foreground">Comienza gratis y en segundos.</p>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <Input id="name" placeholder="Jane Doe" className="pl-9" {...register("name")} />
                    </div>
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <Input id="email" type="email" placeholder="m@example.com" className="pl-9" {...register("email")} />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <Input id="password" type={show.pw ? "text" : "password"} className="pr-10 pl-9" autoComplete="new-password" {...register("password")} />
                      <button type="button" onClick={() => setShow((s) => ({ ...s, pw: !s.pw }))} className="absolute inset-y-0 right-2 grid place-items-center rounded-md px-2 text-muted-foreground transition hover:text-foreground">
                        {show.pw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Barra de fuerza */}
                    <div className="h-2 w-full overflow-hidden rounded bg-muted">
                      <div className="h-full transition-all" style={{ width: `${strength * 10}%` }}
                        data-strength={strength}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Usa 8+ caracteres con mayúsculas, minúsculas y números.</p>
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm">Confirmar contraseña</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <Input id="confirm" type={show.cpw ? "text" : "password"} className="pr-10 pl-9" autoComplete="new-password" {...register("confirm")} />
                      <button type="button" onClick={() => setShow((s) => ({ ...s, cpw: !s.cpw }))} className="absolute inset-y-0 right-2 grid place-items-center rounded-md px-2 text-muted-foreground transition hover:text-foreground">
                        {show.cpw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading || !isValid}>
                  {loading ? "Creando cuenta…" : "Crear cuenta"}
                </Button>

                <div className="relative">
                  <Separator className="my-6" />
                  <span className="bg-card text-muted-foreground absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">o continúa con</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" type="button" onClick={() => signIn("google")}> <IconoGoogle className="mr-2 h-5 w-5" /> Google</Button>
                  <Button variant="outline" type="button" onClick={() => signIn("github")}> <IconoGitHub className="mr-2 h-5 w-5" /> GitHub</Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">¿Ya tienes cuenta? <Link className="underline underline-offset-4" href="/sign-in">Inicia sesión</Link></p>
              </div>
            </form>

            {/* Columna derecha: copy simple / beneficios */}
            <div className="hidden h-full w-full flex-col items-center justify-center gap-6 bg-muted p-8 md:flex">
              <div className="w-full max-w-xs space-y-2">
                <h3 className="text-xl font-semibold">Beneficios rápidos</h3>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  <li>Tablero listo al crear tu cuenta</li>
                  <li>Autenticación social en 1 clic</li>
                  <li>Seguridad y buenas prácticas por defecto</li>
                </ul>
              </div>

              <div className="w-full max-w-xs rounded-xl border bg-background/70 p-4 text-sm shadow-sm backdrop-blur">
                <p className="font-medium">¿Por qué pedimos contraseña fuerte?</p>
                <p className="text-muted-foreground">Protege tu cuenta frente a ataques de fuerza bruta y credenciales filtradas.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
