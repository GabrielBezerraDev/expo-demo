import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
} from "react-native";
import { FlatList } from "react-native";
import { Divider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface PickerInterface {
  value: any;
  label: string;
}
interface PickerOptionsInterface {
  execFunction: (closeModal: (...args:any) => void) => void;
  setVariable: (value: any) => void;
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

export type ItemProps = {
  item: any;
  onPress: () => void;
  style?: any;
};

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
    const [isVisibleSubModal, setIsVisibleSubModal] = useState(false);

    const teste = () => {
      setIsVisibleSubModal(true);
    };

    const closeModalt = useCallback((value?:string) => {
      console.log(value);
      setIsVisible(false);
      setIsVisibleSubModal(false);
    },[]);

    const closeModal = () => {
      // console.log(value);
      setIsVisible(false);
      // setIsVisibleSubModal(false);
    };


    const Item = ({ item, onPress, style }: ItemProps) => (
      <TouchableOpacity
        onPress={onPress}
        style={{ ...style, padding: 20, backgroundColor: "rgb(255, 255, 255)" }}
      >
        <View>
          <Text style={{ fontWeight: "bold" }}>{item.label}</Text>
        </View>
        <Divider style={{ marginVertical: 5 }} />
      </TouchableOpacity>
    );

    const renderItem = ({ item }: { item: any }) => {
      return (
        <Item
          item={item}
          onPress={() => {
            pickerOptios?.execFunction(function(){
              closeModalt(item.value);
            });
          }}
        />
      );
    };

    const testeAlert = useCallback(() => {
      setIsVisibleSubModal(true);
    }, []);

    useImperativeHandle(
      ref,
      () =>
        ({
          setIsVisible: setIsVisible,
        } as BlockingModalHandle)
    );
    // const pickerTable = (): React.ReactNode => {
    //   let setPickerOptios = pickerOptios as PickerOptionsInterface;
    //   return (
    //     <Picker
    //       onValueChange={(itemValue: number) =>
    //         setPickerOptios.setVariable(itemValue)
    //       }
    //       style={styles.picker}
    //     >
    //       <Picker.Item label="Selecione uma comida..." value="" />

    //       {setPickerOptios.selectValue.map(
    //         (value: PickerInterface, index: number) => (
    //           <Picker.Item
    //             key={index}
    //             label={value.label}
    //             value={value.value}
    //           />
    //         )
    //       )}
    //     </Picker>
    //   );
    // };

    const InputSelect = (): React.ReactNode => {
      return (
        <TextInput onTouchStart={testeAlert}  style={styles.input}/>
      );
    }

    const Select = (): React.ReactNode => {
      return (
        <Modal
          visible={isVisibleSubModal}
          transparent={true}
          animationType="fade"
          // onRequestClose={closeModal}
        >
          <View style={styles.overlaySubModal}>
            <View style={styles.subModal}>
              <SafeAreaProvider style={{ width: "100%" }}>
                <SafeAreaView>
                  <FlatList
                    style={{ paddingVertical: 20 }}
                    data={modalOptions.pickerOptions?.selectValue}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.value}
                    // extraData={selectedId}
                  />
                </SafeAreaView>
              </SafeAreaProvider>
            </View>
          </View>
        </Modal>
      );
    };

    return (
      <>
        <Select />
        <Modal
          visible={isVisible}
          transparent={true}
          animationType="fade"
          // onRequestClose={closeModal}
        >
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>{modalOptions.modalText}</Text>
              {modalOptions.activePicker && pickerOptios && <InputSelect/>}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={
                  modalOptions.activePicker
                    ? function () {
                        teste();
                      }
                    : closeModal
                }
              >
                <Text style={styles.buttonText}>
                  {modalOptions.buttonTitle}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  }
);

const screen = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  overlaySubModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  subModal: {
    width: screen.width * 0.8,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    maxHeight: "55%",
    overflowY: "auto",
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
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 15,
    overflow: "hidden",
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
