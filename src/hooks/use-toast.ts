
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast"
import {
  useToast as useToastOriginal,
} from "@/components/ui/use-toast"

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number
}

export const useToast = () => {
  const methods = useToastOriginal()
  
  // Set default duration to 5 seconds if not specified
  const toast = (props: ToasterToast) => {
    methods.toast({
      ...props,
      duration: props.duration ?? 5000,
    })
  }

  return {
    ...methods,
    toast,
  }
}

export { Toast, type ToasterToast, toast } from "@/components/ui/use-toast"
