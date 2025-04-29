import { forwardRef, useImperativeHandle, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Snackbar } from "react-native-paper";

const SnackBarComponent = forwardRef(
  ({ text }: { text: string }, ref?) => {
    const [visible, setVisible] = useState(false);
    const teste = () => {alert("TESTE")}

    useImperativeHandle(ref,() => {
        return {
            setVisible: setVisible,
            teste:teste
        }
    })

    const onToggleSnackBar = () => setVisible(!visible);

    const onDismissSnackBar = () => setVisible(false);


    return (

        <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}
          action={{
            label: "teste",
            onPress: () => {},
          }}
        >
          {text}
        </Snackbar>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});

export default SnackBarComponent;
