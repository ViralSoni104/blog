"use client";
import { IconLoader2 } from "@tabler/icons-react";
import { FormMessage } from "@/components/auth/ui/auth-form-message";
import { CardWrapper } from "@/components/auth/ui/auth-card-wrapper";

interface UnsubscribeProps {
  success?: string;
  error?: string;
  loading?: boolean;
}

export const Unsubscribe = ({ success, error, loading }: UnsubscribeProps) => {
  return (
    <CardWrapper
      headerTitle="Unsubscribe"
      headerLabel="Confirming your request"
      backButtonSubLabel="Back to Login"
      backButtonHref="/auth/login"
      showSocial={false}
      showBorder
      showBackButtonArrow={true}
    >
      <div className="flex flex-col justify-center w-full">
        {loading && (
          <div className="flex flex-col items-center">
            <IconLoader2 className="size-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm animate-pulse">
              Validating token...
            </p>
          </div>
        )}

        <FormMessage error={error} success={success} top={0} />
      </div>
    </CardWrapper>
  );
};
