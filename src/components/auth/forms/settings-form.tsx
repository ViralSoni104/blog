"use client";
import { useRef, useEffect, useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { m } from "motion/react";
import {
  IconUser,
  IconShieldLock,
  IconLoader2,
  IconMail,
  IconCamera,
  IconSettings,
  IconLock,
} from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { FormMessage } from "@/components/auth/ui/auth-form-message";
import { SettingsSchema } from "@/schemas";
import { settings } from "@/actions/settings";
import { fadeUp } from "@/lib/motion";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { ExtendedUser } from "@/next-auth";
import { uploadFile } from "@/hooks/use-image-upload";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";

type Schema = z.infer<typeof SettingsSchema>;

export default function SettingsPage({ user }: { user: ExtendedUser }) {
  const { data: session, update } = useSession();
  const isOAuth = user?.isOAuth;

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Create a ref for the file input element to access its files easily
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<Schema>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: user?.name || "",
      isTwoFactorEnabled: !!user?.isTwoFactorEnabled,
      password: "",
      newPassword: "",
    },
  });
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        isTwoFactorEnabled: !!user.isTwoFactorEnabled,
        password: "",
        newPassword: "",
      });
    }
  }, [user, form]);
  const { isSubmitting, isDirty } = form.formState;

  const onSubmit = (values: Schema) => {
    if (!form.formState.isDirty) return;
    setError("");
    setSuccess("");
    let res;
    startTransition(async () => {
      try {
        res = await settings(values);
      } catch {
        setError("Something went wrong");
      }
      if (res?.success === false) {
        setError(res.message);
      }
      if (res?.success) {
        await update();
        setSuccess(res.message);
      }
      form.reset({
        ...values,
        password: "",
        newPassword: "",
      });
    });
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setError("");
    setSuccess("");
    // Access the file input element using the ref
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      setError("Please select a file to upload");
      setIsUploading(false);
      return;
    }
    // Extract the first file from the file input
    const file = fileInput.files[0];
    const validTypes = ["image/jpeg", "image/png"];
    // Check Size (500KB limit)
    const maxSize = 500 * 1024; // 500KB in bytes
    const fileConfig = {
      file: file,
      maxSize: maxSize,
      allowedTypes: validTypes,
      folder: "/profile-avatars",
    };
    const uploadRes = await uploadFile(fileConfig);
    if (uploadRes?.success === false) {
      setError(uploadRes.message);
    }
    if (uploadRes?.success) {
      const res = await settings({ image: uploadRes.uploadResponse.url });
      if (res?.success === false) {
        setError(res.message);
      }
      if (res?.success) {
        await update({
          image: uploadRes.uploadResponse.url,
        });
        setSuccess("Settings updated!");
      }
    }
    setIsUploading(false);
  };

  return (
    <div className="w-full max-w-[600px] mx-auto space-y-4 px-1.5 md:px-4 pt-5 md:py-8">
      <SiteBreadcrumb
        items={[
          { label: "Auth", icon: IconLock },
          { label: "Settings", icon: IconSettings },
        ]}
        className="md:px-0 px-2.5 mb-0"
      />

      <m.div
        {...fadeUp}
        className="md:border border-muted-foreground/20 rounded-3xl px-2.5 md:p-6 md:p-8 md:shadow-xl"
      >
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Profile Settings
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your personal info and security
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="personal" className="w-full">
            {/* Minimalist TabsList */}
            <TabsList
              className={cn(
                "grid w-full p-1 h-30 bg-muted/30 rounded-xl mb-8 flex items-center border-muted border-2",
                user?.isOAuth ? "grid-cols-1" : "grid-cols-2",
              )}
            >
              <TabsTrigger
                value="personal"
                className="rounded-lg h-full p-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <IconUser size={18} strokeWidth={2} />
                  <span className="font-medium hidden sm:inline">Personal</span>
                </div>
              </TabsTrigger>

              {!user?.isOAuth && (
                <TabsTrigger
                  value="account"
                  className="rounded-lg h-full p-3 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black transition-all duration-300"
                >
                  <div className="flex items-center gap-2">
                    <IconShieldLock size={18} strokeWidth={2} />
                    <span className="font-medium hidden sm:inline">
                      Security
                    </span>
                  </div>
                </TabsTrigger>
              )}
            </TabsList>

            <FieldGroup className="flex flex-col gap-6">
              {/* TAB 1: PERSONAL DETAILS */}
              <TabsContent
                value="personal"
                className="space-y-4 md:space-y-6 outline-none mt-0"
              >
                <div className="flex justify-center">
                  {user && (
                    <>
                      <div className="flex flex-col items-center group">
                        <div className="relative">
                          <m.div
                            whileHover={{ scale: 1.02 }}
                            className="relative rounded-full p-1 border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-colors"
                          >
                            <Avatar className="size-28 md:size-32">
                              <AvatarImage
                                src={session?.user?.image}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-4xl font-bold bg-muted text-foreground/80">
                                {getInitials(user?.name)}
                              </AvatarFallback>
                            </Avatar>
                          </m.div>

                          {/* Camera Button */}
                          <m.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="absolute bottom-1 right-1 p-2.5 bg-foreground border-muted/40 border-1 text-background rounded-full shadow-lg hover:bg-primary transition-colors z-20"
                          >
                            {isUploading ? (
                              <IconLoader2 className="size-4 animate-spin" />
                            ) : (
                              <IconCamera className="size-4" />
                            )}
                          </m.button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={() => handleUpload()} // Your existing logic
                            className="hidden"
                            accept="image/png, image/jpeg"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-xs uppercase tracking-widest opacity-70">
                        Display Name
                      </FieldLabel>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="John Doe"
                        className="h-12 rounded-xl"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </TabsContent>

              {/* TAB 2: ACCOUNT & SECURITY */}
              {!isOAuth && (
                <TabsContent
                  value="account"
                  className="space-y-6 outline-none mt-0"
                >
                  <div className="p-4 rounded-xl bg-chart-1/20 border border-blue-100/50 flex items-center gap-3 text-sm text-foreground">
                    <div className="p-2 bg-white rounded-full shadow-sm">
                      <IconMail size={16} className="text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider opacity-60 font-bold">
                        Email Address
                      </span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <Controller
                      name="password"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel className="text-xs uppercase tracking-widest opacity-70">
                            Current Password
                          </FieldLabel>
                          <Input
                            {...field}
                            disabled={isPending}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 rounded-xl"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name="newPassword"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel className="text-xs uppercase tracking-widest opacity-70">
                            New Password
                          </FieldLabel>
                          <Input
                            {...field}
                            disabled={isPending}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="h-12 rounded-xl"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </div>
                  <div className="flex items-end justify-start space-x-1 px-1">
                    <input
                      type="checkbox"
                      id="showPassword"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="size-3 rounded border-muted-foreground/30 accent-primary cursor-pointer"
                    />
                    <label
                      htmlFor="showPassword"
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Show Passwords
                    </label>
                  </div>

                  <Controller
                    name="isTwoFactorEnabled"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold">
                            Two-Factor Auth
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Extra security for your login
                          </p>
                        </div>
                        <Switch
                          disabled={isPending}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </div>
                    )}
                  />
                </TabsContent>
              )}
            </FieldGroup>

            <div className="mt-8">
              <Button
                disabled={isSubmitting || !isDirty}
                className="w-full h-12 rounded-xl font-bold text-lg shadow-md shadow-primary/10 text-background"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <IconLoader2 className="animate-spin size-5" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </Tabs>
        </form>

        <FormMessage error={error} success={success} />
      </m.div>
    </div>
  );
}
