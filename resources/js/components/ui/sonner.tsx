import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          success: 'group toast group-[.toaster]:bg-green-800 group-[.toaster]:text-green-100 group-[.toaster]:border-green-900',
          error: 'group toast group-[.toaster]:bg-red-600 group-[.toaster]:text-red-50 group-[.toaster]:border-red-700',
          warning: 'group toast group-[.toaster]:bg-amber-600 group-[.toaster]:text-amber-50 group-[.toaster]:border-amber-700',
          info: 'group toast group-[.toaster]:bg-blue-600 group-[.toaster]:text-blue-50 group-[.toaster]:border-blue-700',
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
