// Inspired by react-hot-toast library
import * as React from "react"

// Define ToastActionElement as a generic ReactElement for now.
// The actual ToastAction component will be in toast.tsx.
type ToastActionElement = React.ReactElement;

interface ToastProps {
  // id is usually assigned by the toast system, not passed in by user
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number
  variant?: "default" | "destructive"
  // Props for the visual component, will be used by Toaster
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// This interface is for the props of the actual ToastAction component,
// which will live in toast.tsx. It's useful for type safety if action elements are constructed.
// altText is not a standard prop for Radix UI Action. If needed, it should be passed as children or aria-label.
// Removing altText from here to simplify.
interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // altText?: string; 
}
// No implementation of ToastAction here.

const TOAST_LIMIT = 1 // Max number of toasts visible at once
const TOAST_REMOVE_DELAY = 1000 * 60 * 60 * 24 // 24 hours - effectively infinite for manual dismiss

type ToasterToast = Omit<ToastProps, "id"> & { // id will be generated
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! SideEffects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast(props: Toast) {
  const id = genId()

  const update = (updatedProps: Partial<ToasterToast>) => // props should be Partial<ToasterToast>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...updatedProps, id }, // Ensure id is included
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  const newToast: ToasterToast = {
    ...props,
    id,
    open: true,
    onOpenChange: (open: boolean) => {
      if (!open) dismiss()
    },
  };

  dispatch({
    type: "ADD_TOAST",
    toast: newToast,
  })

  return {
    id: id, // Return the generated id
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast, // return the toast function itself for direct use
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

// Export ToastActionProps for use in toast.tsx, but not ToastAction component itself
export { useToast, toast }
export type { ToastProps, ToastActionProps, ToastActionElement }
