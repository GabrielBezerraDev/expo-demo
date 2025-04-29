import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal as ModalPaper } from "react-native-paper";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Button,
  ScrollView,
  Touchable,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
} from "react-native";
import { FlatList } from "react-native";
import { Divider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import SnackBarComponent from "./SnackBar";

interface PickerInterface {
  value: any;
  label: string;
}
interface PickerOptionsInterface {
  execFunction: (closeModal: (...args: any) => void) => void;
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
    let snackBar = useRef<any>(null);
    const [subModalPointerEvent, setSubModalPointerEvent] = useState<ViewStyle>(
      { pointerEvents: "none" }
    );
    const [table, setTable] = useState("");
    const [inputValue, setinputValue] = useState("");
    // const [selectTable, setselectTable] = useState("Selecione a Mesa");

    const closeAllModal = useCallback((value?: string) => {
      setIsVisible(false);
      setIsVisibleSubModal(false);
    }, []);

    const closeModal = () => {
      setIsVisible(false);
    };

    const closeSubModal = () => {
      setIsVisibleSubModal(false);
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
            setTable(item.value);
          }}
        />
      );
    };

    const testeAlert = useCallback(() => {
      setIsVisibleSubModal(true);
      setTimeout(
        () => setSubModalPointerEvent({ pointerEvents: "auto" }),
        1000
      );
    }, []);

    useImperativeHandle(
      ref,
      () =>
        ({
          setIsVisible: setIsVisible,
        } as BlockingModalHandle)
    );

    const InputSelect = (): React.ReactNode => {
      return (
        <TextInput
          value={inputValue}
          onTouchStart={testeAlert}
          style={styles.input}
        />
      );
    };

    const Select = useCallback((): React.ReactNode => {
      return <Text style={{ color: "red" }}>{table}</Text>;
    }, [table]);

    return (
      <>
        {/* <SnackBarComponent
          ref={snackBar}
          text="Escolha um número antes de confirmar"
        /> */}

        <Modal visible={isVisible} transparent={true} animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>{modalOptions.modalText}</Text>
              {modalOptions.activePicker && pickerOptios && <InputSelect />}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={
                  modalOptions.activePicker
                    ? function () {
                        pickerOptios?.execFunction(function () {
                          closeModal();
                        });
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
        <Modal visible={isVisibleSubModal} transparent={true}>
          <View style={styles.overlaySubModal}>
            <View style={styles.subModal}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  padding: 10,
                  gap: 20,
                  width: "100%",
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                  Selecione a Mesa: <Select />
                </Text>
              </View>
              <View style={{ width: "100%", height: "70%", overflowY: "auto" }}>
                <SafeAreaProvider style={{ width: "100%" }}>
                  <SafeAreaView>
                    <FlatList
                      style={{ paddingVertical: 20, ...subModalPointerEvent }}
                      data={modalOptions.pickerOptions?.selectValue}
                      renderItem={renderItem}
                      keyExtractor={(item) => item.value}
                    />
                  </SafeAreaView>
                </SafeAreaProvider>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  padding: 20,
                  gap: 20,
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <Button
                  color="#FFA500"
                  title="Cancelar"
                  onPress={() => {
                    setinputValue("");
                    setTable("");
                    setSubModalPointerEvent({ pointerEvents: "none" });
                    closeSubModal();
                  }}
                ></Button>
                <Button
                  color="#FFA500"
                  title="Confirmar Mesa"
                  onPress={() => {
                    setinputValue(`Mesa ${table}`);
                    setSubModalPointerEvent({ pointerEvents: "none" });
                    if (table) {
                      closeSubModal();
                      pickerOptios?.setVariable(table);
                    }
                    else {
                      alert("Escolha uma Mesa antes de confirmar!");
                    //   if (snackBar.current) {
                    //     snackBar.current.setVisible(true);
                    //     snackBar.current.teste();
                    // }
                      }
                  }}
                ></Button>
              </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlaySubModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  subModal: {
    width: screen.width * 0.8,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    maxHeight: "60%",
    display: "flex",
    flexDirection: "column",
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
    width: "100%",
  },
  buttonText: {
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
});

export default BlockingModal;
