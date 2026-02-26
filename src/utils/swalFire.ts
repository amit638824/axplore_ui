import Swal, { SweetAlertOptions } from "sweetalert2";  
import { toast, ToastOptions } from "react-toastify";

export const showAlert = (
  type: "success" | "error" | "warning" | "info",
  message: string,
  title?: string,
  options?: ToastOptions & { showCancelButton?: boolean }
) => {
  // ⚠️ react-toastify confirm dialog support nahi karta
  if (options?.showCancelButton) {
    console.warn(
      "react-toastify does not support confirm dialogs. Use a modal instead."
    );
  }

  const toastOptions: ToastOptions = {
    autoClose: 2000,
    closeButton: true,
    pauseOnHover: true,
    draggable: true,
    ...options,
  };

  const content = title ? `${message}` : message;

  switch (type) {
    case "success":
      return toast.success(content, toastOptions);

    case "error":
      return toast.error(content, toastOptions);

    case "warning":
      return toast.warn(content, toastOptions);

    case "info":
    default:
      return toast.info(content, toastOptions);
  }
};


export const showConfirmAlert = async ({
  title = "Are you sure?",
  text = "You won't be able to revert this!",
  confirmText = "Yes, confirm!",
  cancelText = "Cancel",
  icon = "warning",
}: {
  title?: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: "warning" | "question" | "info";
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });

  return result.isConfirmed;
};


// export const showAlert = (
//   type: "success" | "error" | "warning" | "info",
//   message: string,
//   title?: string,
//   options?: SweetAlertOptions
// ) => {
//   const isConfirmDialog = options?.showCancelButton;

//   return Swal.fire({
//     icon: type,
//     title: title || capitalize(type),
//     text: message,

//     // 🔁 DEFAULT BEHAVIOR (existing alerts)
//     showConfirmButton: isConfirmDialog ? true : false,
//     timer: isConfirmDialog ? undefined : 2000,
//     timerProgressBar: !isConfirmDialog,

//     //  OVERRIDES
//     ...options,

//     didOpen: () => {
//       if (!isConfirmDialog) {
//         Swal.stopTimer();
//         Swal.resumeTimer();
//       }
//     },
//   });
// };

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);
