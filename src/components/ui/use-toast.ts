
// Re-export from the hooks folder to maintain backwards compatibility
import { useToast, toast } from "@/hooks/use-toast";
import type { ToasterToast, ToastActionElement, ToastProps } from "@/hooks/use-toast";

export { useToast, toast };
export type { ToasterToast, ToastActionElement, ToastProps };
