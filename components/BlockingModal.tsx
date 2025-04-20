import { Picker } from "@react-native-picker/picker";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
} from "react-native";

interface PickerInterface {
  value: any;
  label: string;
}
interface PickerOptionsInterface {
  execFunction: (closeModal: () => void) => void;
  setVariable: (value:any) => void;
  selectValue: PickerInterface[];
  titlePlaceHolder: string;
}

interface ModalOptionsInterface {
  modalText: string;
  buttonTitle: string;
  visible?: boolean;
  activePicker?: boolean;
  pickerOptions?: PickerOptionsInterface;
}

export interface BlockingModalHandle {
  setIsVisible: (visible: boolean) => void;
}

const BlockingModal = forwardRef(
  ({ modalOptions }: { modalOptions: ModalOptionsInterface }, ref?) => {

    let pickerOptios: PickerOptionsInterface | undefined;
    if (modalOptions.activePicker) {
      pickerOptios = modalOptions.pickerOptions;
    }
    const [isVisible, setIsVisible] = useState(modalOptions.visible ?? false);
    
    const closeModal = () => setIsVisible(false);

    useImperativeHandle(
      ref,
      () =>
        ({
          setIsVisible: setIsVisible,
        } as BlockingModalHandle)
    );

    return (
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View  style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{modalOptions.modalText}</Text>
            {(() => {
              if (modalOptions.activePicker && pickerOptios) {
                return (
                  <Picker
                    onValueChange={(itemValue: any) => pickerOptios.setVariable(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label={pickerOptios.titlePlaceHolder} value="" />
  
                    {pickerOptios.selectValue.map((value: PickerInterface, index: number) => (
                      <Picker.Item key={index} label={value.label} value={value.value} />
                    ))}
                  </Picker>
                );
              }
            })()}
            <TouchableOpacity style={styles.closeButton} onPress={modalOptions.activePicker ? function(){pickerOptios?.execFunction(closeModal)} : closeModal}>
              <Text style={styles.buttonText}>{modalOptions.buttonTitle}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
);

const screen = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: screen.width * 0.8,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  picker: {
    padding: 10,
    marginBottom: 10
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
});

export default BlockingModal;
