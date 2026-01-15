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

interface UIStore {
  modalVisible: boolean;
  modalOptions: ModalOptions;
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
  
  // Shortcuts
  showAlert: (title: string, message: string, type?: ModalType) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, primaryText?: string) => void;
}

const defaultOptions: ModalOptions = {
  title: '',
  message: '',
  type: 'info',
};

export const useUIStore = create<UIStore>((set, get) => ({
  modalVisible: false,
  modalOptions: defaultOptions,
  
  showModal: (options) => set({
    modalVisible: true,
    modalOptions: { ...defaultOptions, ...options }
  }),
  
  hideModal: () => set({ modalVisible: false }),
  
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
