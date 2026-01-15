import React from 'react';
import { useUIStore } from '../../store/useUIStore';
import { CustomModal } from './CustomModal';

export const GlobalModal = () => {
  const { modalVisible, modalOptions, hideModal } = useUIStore();

  return (
    <CustomModal
      visible={modalVisible}
      onClose={hideModal}
      {...modalOptions}
    />
  );
};
