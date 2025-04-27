import { Modal, Portal } from "react-native-paper";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { PaperSelect } from "react-native-paper-select";

interface PickerInterface {
  _id: any;
  value: string;
  disabled: boolean
}

interface PickerOptionsInterface {
  execFunction: (closeModal: () => void) => void;
  setVariable: (value: any) => void;
  selectValue: {
    value: any;
    list: PickerInterface[];
    selectedList: any[];
    error: string;
  };
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
    const [isVisible, setIsVisible] = useState(modalOptions.visible ?? false);
    const [selectedValue, setSelectedValue] = useState<any>(null);
    const pickerOptions = modalOptions.pickerOptions;

    const closeModal = () => setIsVisible(false);

    useImperativeHandle(ref, () => ({
      setIsVisible: setIsVisible,
    }));

    return (
      <Portal>
        <Modal
          visible={isVisible}
          onDismiss={closeModal}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.content}>
            <Text style={styles.modalText}>{modalOptions.modalText}</Text>

            {modalOptions.activePicker && pickerOptions && (
              <View style={styles.pickerWrapper}>
                <PaperSelect
                  label="Escolha a Mesa"
                  dialogStyle={{
                    backgroundColor: "#ffff",
                  }}
                  dialogTitleStyle={{
                    color: "#00000",
                  }}
                  selectAllEnable={false}
                  textColor={"black"}
                  arrayList={pickerOptions.selectValue.list}
                  selectedArrayList={pickerOptions.selectValue.selectedList}
                  multiEnable={false}
                  value={selectedValue}
                  onSelection={(itemValue) => {
                    const selectedItem = pickerOptions.selectValue.list.find(
                      (item) => item._id === itemValue.selectedList[0]?._id
                    );
                    setSelectedValue(selectedItem?.value);
                    pickerOptions.setVariable(selectedItem?.value);
                  }}
                  textInputStyle={styles.input}
                  checkboxProps={{ checkboxLabelStyle: { color: "black", marginRight:50 } }}
                  searchStyle={{backgroundColor:"black"}}
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                if (modalOptions.activePicker) {
                  pickerOptions?.execFunction(closeModal);
                } else {
                  closeModal();
                }
              }}
            >
              <Text style={styles.buttonText}>{modalOptions.buttonTitle}</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    );
  }
);

const screen = Dimensions.get("window");

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    boxShadow: "none"
  },
  content: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: screen.width * 0.8,
  },
  pickerWrapper: {
    zIndex: 1000, 
    marginVertical: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    marginTop: 15,
    alignSelf: "center",
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
  input: {
    backgroundColor: "white",
    borderColor: "#ccc",
    borderWidth: 1,
    color:"black"
  },
});

export default BlockingModal;
