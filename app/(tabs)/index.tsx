import React, { useState, useEffect, useCallback } from "react";
import {
  Image,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Button,
  Text,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "../../components/Card";
import { View } from "react-native";
import { ScrollView } from "react-native";
import { supabase } from "@/services/supabase";
import BlockingModal from "@/components/BlockingModal";
import { OrderInterfaceGet } from "@/interfaces/OrderInterface";

export default function HomeScreen() {
  const [orders, setOrder] = useState<OrderInterfaceGet[]>([]);
  const [table, setTable] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar mesa do AsyncStorage
  useEffect(() => {
    const loadTable = async () => {
      const tableLocalStorage = await AsyncStorage.getItem("table");
      if (tableLocalStorage) {
        setTable(Number(JSON.parse(tableLocalStorage).table));
      }
    };
    loadTable();
  }, []);

  // Buscar pedidos
  const fetchOrder = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("Order")
        .select()
        .eq("finishOrder", true);

      if (error) throw error;
      
      setOrder(data as OrderInterfaceGet[]);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Atualizar lista ao montar componente
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const setTableUser = useCallback(async (closeModal: () => void) => {
    closeModal();
    if (table) {
      await AsyncStorage.setItem("table", JSON.stringify({ table }));
    }
  }, [table]);

  // const setTableUser = async (closeModal: () => void) => {
  //   console.log("TESTE");
  //   closeModal();
  //   if (table) {
  //     await AsyncStorage.setItem("table", JSON.stringify({ table }));
  //   }
  // };


  return (
    <>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
          <Button title="Recarregar" onPress={fetchOrder} color={"#FFA500"} />
        </View>
      ) : (
        <ScrollView style={styles.container}>
          {orders.map((order, index) => (
            <Card key={index} order={order} />
          ))}
        </ScrollView>
      )}
      <BlockingModal
        modalOptions={{
          modalText: "Qual é a sua mesa?",
          buttonTitle: "Selecionar mesa",
          visible: !table,
          activePicker: true,
          pickerOptions: {
            titlePlaceHolder: "Escolha a Mesa",
            selectValue: [
              { value: 1, label: "Mesa 1" },
              { value: 2, label: "Mesa 2" },
              { value: 3, label: "Mesa 3" },
              { value: 4, label: "Mesa 4" },
              { value: 5, label: "Mesa 5" },
              { value: 6, label: "Mesa 6" },
              { value: 7, label: "Mesa 7" },
              { value: 7, label: "Mesa 7" },
              { value: 7, label: "Mesa 7" },
              { value: 7, label: "Mesa 7" },
              { value: 7, label: "Mesa 7" },
              { value: 7, label: "Mesa 7" },

            ],
            setVariable: setTable,
            execFunction: setTableUser,
          },
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
});
