"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/modules/customers/actions/customer.actions";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/modules/customers/schemas/customer.schema";

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: UpdateProfileInput;
}) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
  });

  async function onSubmit(values: UpdateProfileInput) {
    setFormError(null);
    const result = await updateProfile(values);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    toast.success("Perfil atualizado.");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-md space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone (DDD + número)</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  placeholder="11999999999"
                  autoComplete="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {formError && (
          <p className="text-sm font-medium text-destructive">{formError}</p>
        )}

        <Button
          type="submit"
          variant="gold"
          disabled={form.formState.isSubmitting}
        >
          Salvar alterações
        </Button>
      </form>
    </Form>
  );
}
