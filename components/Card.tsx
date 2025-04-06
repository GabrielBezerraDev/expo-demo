import { OrderInterfaceGet } from "@/interfaces/OrderInterface";
import { supabase } from "@/services/supabase";
import { StyleSheet, View, Text } from "react-native";
import { useEffect, useState } from "react";

export function Card({ order }: { order: OrderInterfaceGet }) {
  const [foodName, setFoodName] = useState("");

  useEffect(() => {
    const fetchFood = async () => {
      const { data, error } = await supabase
        .from("Menu")
        .select("food")
        .eq("id", order.food);
      
      if (data && data.length > 0) {
        setFoodName(data[0].food);
      }
    };
    
    fetchFood();
  }, [order.food]);

  const formatDate = () => {
    return new Date(order.createdAt).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(",","");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.h2}>
          {order.clientName} - Mesa {order.tableNumber}
        </Text>
        <View style={styles.separator} />
        <Text style={styles.text}>Pedido: {foodName}</Text>
        <Text style={styles.text}>Data e Hora do pedido: {formatDate()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    width: "90%",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  h2: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    marginVertical: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 8,
  },
});