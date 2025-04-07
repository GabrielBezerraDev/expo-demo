import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "@/services/supabase";
import { OrderInterfacePost } from "@/interfaces/OrderInterface";
import { Food } from "@/interfaces/FoodInterface";
import BlockingModal, { BlockingModalHandle } from "@/components/BlockingModal";

export default function OrderForm() {
  useEffect(() => {
    getFoods();
  }, []);
  const [selectedFood, setSelectedFood] = useState<Food[]>([]);
  const [food, setFood] = useState<number>(0);
  const [specifications, setSpecifications] = useState("");
  const [clientName, setClientName] = useState("");
  const [tableNumber, setTableNumber] = useState("");


  const modalRef = useRef<BlockingModalHandle>(null);

  const getFoods = async () => {
    const { data, error } = await supabase.from("Menu").select("food, id");
    setSelectedFood(data as Food[]);
    console.log(data);
  };

  const newOrder = async (order: OrderInterfacePost) => {
    const { data, error } = await supabase
      .from("Order")
      .insert([order])
      .select();
  };

  const handleSubmit = () => {
    if (!clientName || !food) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    let table: string | number = localStorage.getItem("table") as string;
    if (table) {
      table = Number(JSON.parse(table as string).table) as number;
    }

    const orderData: OrderInterfacePost = {
      clientName: clientName,
      food: Number(food),
      descriptionOrder: specifications,
      tableNumber: table as number,
    };

    if (modalRef.current) {
      modalRef.current.setIsVisible(true);
    }

    newOrder(orderData);
    setFood(0);
    setSpecifications("");
    setClientName("");
    setTableNumber("");

    Alert.alert("Sucesso", "Pedido registrado!");
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BlockingModal
        ref={modalRef}
        modalOptions={{
          modalText: "Pedido Feito!",
          buttonTitle: "Okay",
        }}
      ></BlockingModal>
      <View>
        <Text style={styles.label}>Nome do Cliente *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome do cliente"
          value={clientName}
          onChangeText={setClientName}
        />
      </View>

      <View>
        <Text style={styles.label}>Comida *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            onValueChange={(itemValue: number) => setFood(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Selecione uma comida..." value="" />

            {selectedFood.map((food: Food, index: number) => (
              <Picker.Item key={index} label={food.food} value={food.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View>
        <Text style={styles.label}>Especificações</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder="Ex: Sem cebola, ponto da carne médio..."
          value={specifications}
          onChangeText={setSpecifications}
        />
      </View>

      {/* <View>
        <Text style={styles.label}>Número da Mesa *</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o número da mesa"
          keyboardType="numeric"
          value={tableNumber}
          onChangeText={setTableNumber}
        />
      </View> */}

      <Button title="Enviar Pedido" onPress={handleSubmit} color="#FFA500" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    minHeight: "100%",
    display: "flex",
    paddingTop: 40,
    gap: 30,
  },
  picker: {
    padding: 10,
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 15,
    overflow: "hidden",
  },
});
