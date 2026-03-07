import { cn } from "@/lib/utils";

const LinesBGContainer = ({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) => {
  return (
    <div className={cn(className, "diagonal-bg w-full max-w-[100vw] mx-auto")}>
      {children}
    </div>
  );
};

export default LinesBGContainer;

export const ContainerMain = ({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) => {
  return (
    <div className={cn(className, "text-foreground mx-auto")}>{children}</div>
  );
};

export const ContainerSection = ({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) => {
  return (
    <div
      className={cn(
        className,
        "h-full w-full overflow-hidden px-4 md:px-8 pt-5",
      )}
    >
      {children}
    </div>
  );
};
/* <div className={cn(className,"z-10 max-w-[92vw] md:max-w-7xl mx-auto")}>
    {children}
</div> */
