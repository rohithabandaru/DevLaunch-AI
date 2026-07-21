import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
};

export default function FormSection({
  title,
  description,
  children,
  action,
}: FormSectionProps) {
  return (
    <Card className="border-0 bg-transparent shadow-none ring-0">
      <CardHeader className="px-0 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">{title}</CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              {description}
            </CardDescription>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-0 pt-4">{children}</CardContent>
    </Card>
  );
}
