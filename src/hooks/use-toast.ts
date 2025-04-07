
import { ToastActionElement, ToastProps } from "@/components/ui/toast"
import {
  useToast as useToastOriginal,
} from "@radix-ui/react-toast"

export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number
}

// Maintain a state of toasts
const TOAST_LIMIT = 20
const TOAST_REMOVE_DELAY = 1000

type ToasterToastState = {
  toasts: ToasterToast[]
}

const toastState: ToasterToastState = {
  toasts: [],
}

let listeners: ((state: ToasterToastState) => void)[] = []

function dispatch(toasts: ToasterToast[]) {
  toastState.toasts = toasts
  listeners.forEach((listener) => {
    listener(toastState)
  })
}

export const useToast = () => {
  const [state, setState] = React.useState<ToasterToastState>(toastState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((listener) => listener !== setState)
    }
  }, [state])

  const toast = React.useMemo(
    () => ({
      ...state,
      toast: (props: Omit<ToasterToast, "id">) => {
        const id = crypto.randomUUID()
        const newToast = {
          ...props,
          id,
          duration: props.duration ?? 5000, // Set default duration to 5 seconds
        }

        dispatch([...state.toasts, newToast].slice(-TOAST_LIMIT))

        return id
      },
      dismiss: (toastId?: string) => {
        if (toastId) {
          dispatch(
            state.toasts.map((t) =>
              t.id === toastId
                ? {
                    ...t,
                    open: false,
                  }
                : t
            )
          )
        } else {
          dispatch(state.toasts.map((t) => ({ ...t, open: false })))
        }
      },
      update: (toastId: string, props: Partial<ToasterToast>) => {
        if (!toastId) return

        dispatch(
          state.toasts.map((t) =>
            t.id === toastId ? { ...t, ...props } : t
          )
        )
      },
    }),
    [state]
  )

  return toast
}

export const toast = (props: Omit<ToasterToast, "id">) => {
  const id = crypto.randomUUID()
  const newToast = {
    ...props,
    id,
    duration: props.duration ?? 5000, // Set default duration to 5 seconds
  }

  dispatch([...toastState.toasts, newToast].slice(-TOAST_LIMIT))

  setTimeout(() => {
    dispatch(
      toastState.toasts.map((t) =>
        t.id === id ? { ...t, open: false } : t
      )
    )
  }, (props.duration ?? 5000) + TOAST_REMOVE_DELAY)

  return id
}

export type { ToastActionElement, ToastProps }
export { ToastActionElement, ToastProps }
