import { toast, ToastOptions } from "react-toastify";

type ToastType = "success" | "error" | "warning" | "info";

export const showToast = (
  message: string,
  type: ToastType = "success",      
  options?: ToastOptions
) => {
  const defaultOptions: ToastOptions = {
    autoClose: 2000,
    pauseOnHover: true,
    closeOnClick: true,
  };

  const finalOptions = { ...defaultOptions, ...options };

  switch (type) {
    case "success":
      toast.success(message, finalOptions);
      break;

    case "error":
      toast.error(message, finalOptions);
      break;

    case "warning":
      toast.warning(message, finalOptions);
      break;

    case "info":
    default:
      toast.info(message, finalOptions);
  }
};
