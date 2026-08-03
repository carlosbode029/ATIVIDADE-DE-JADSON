"use client";

import { useState, type ReactNode } from "react";
import { useForm, type DefaultValues, type FieldValues, type Resolver, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

type ActionResult = { error?: string };

type EntityFormDialogProps<TInput extends FieldValues> = {
  trigger: ReactNode;
  title: string;
  description?: string;
  resolver: Resolver<TInput>;
  defaultValues: DefaultValues<TInput>;
  renderFields: (form: UseFormReturn<TInput>) => ReactNode;
  onSubmit: (values: TInput) => Promise<ActionResult>;
  successMessage?: string;
};

export function EntityFormDialog<TInput extends FieldValues>({
  trigger,
  title,
  description,
  resolver,
  defaultValues,
  renderFields,
  onSubmit,
  successMessage = "Salvo com sucesso.",
}: EntityFormDialogProps<TInput>) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<TInput>({
    resolver,
    defaultValues,
  });

  async function handleSubmit(values: TInput) {
    setFormError(null);
    const result = await onSubmit(values);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    toast.success(successMessage);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setFormError(null);
          form.reset(defaultValues);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            {renderFields(form)}

            {formError && (
              <p className="text-sm font-medium text-destructive">
                {formError}
              </p>
            )}

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Salvar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
