import { create } from 'zustand';
import { ModalType } from '../components/Modal/CustomModal';

interface ModalOptions {
  title: string;
  message: string;
  type?: ModalType;
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  cancelable?: boolean;
}

interface ToastOptions {
  message: string;
  icon?: string;
  iconColor?: string;
  type?: 'success' | 'info' | 'error';
  duration?: number;
}

interface UIStore {
  modalVisible: boolean;
  modalOptions: ModalOptions;
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;

  // Toast
  toastVisible: boolean;
  toastOptions: ToastOptions;
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;

  // Shortcuts
  showAlert: (title: string, message: string, type?: ModalType) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, primaryText?: string) => void;
}

const defaultOptions: ModalOptions = {
  title: '',
  message: '',
  type: 'info',
};

const defaultToastOptions: ToastOptions = {
  message: '',
  type: 'success',
  duration: 3000,
};

export const useUIStore = create<UIStore>((set, get) => ({
  modalVisible: false,
  modalOptions: defaultOptions,

  showModal: (options) => set({
    modalVisible: true,
    modalOptions: { ...defaultOptions, ...options }
  }),

  hideModal: () => set({ modalVisible: false }),

  // Toast
  toastVisible: false,
  toastOptions: defaultToastOptions,

  showToast: (options) => {
    set({
      toastVisible: true,
      toastOptions: { ...defaultToastOptions, ...options }
    });

    // Auto hide
    setTimeout(() => {
      get().hideToast();
    }, options.duration || defaultToastOptions.duration);
  },

  hideToast: () => set({ toastVisible: false }),

  showAlert: (title, message, type = 'info') => {
    get().showModal({
      title,
      message,
      type,
      primaryButtonText: 'OK',
    });
  },

  showConfirm: (title, message, onConfirm, primaryText = 'Confirm') => {
    get().showModal({
      title,
      message,
      type: 'confirm',
      primaryButtonText: primaryText,
      onPrimaryPress: () => {
        onConfirm();
        get().hideModal();
      },
      secondaryButtonText: 'Cancel',
      onSecondaryPress: () => get().hideModal(),
    });
  },
}));
