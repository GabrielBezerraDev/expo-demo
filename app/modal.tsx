import { supabase } from "@/services/supabase";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { Link } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Dimensions,
  LayoutChangeEvent,
  Button,
  Module,
  Platform,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import Animated, { SlideInRight } from "react-native-reanimated";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTheme,
} from "victory-native";

type Mode = "date" | "time" | "datetime";

async function getFoods(): Promise<any> {
  let formatData: any[] = [];
  let dataMenuColumns = new Map<string, any>();
  let response = (await supabase.from("Menu").select(`id, food`)) as any;
  let dataMenu: any = response.data;
  dataMenu.forEach((menu: any) => {
    dataMenuColumns.set(menu.food, {
      key: menu.id,
      label: menu.food,
    });
  });
  // console.log(dataMenuColumns.entries());
  let { data, error } = (await supabase.from("Order").select(`
    Menu!food (id, food)
  `)) as any;
  // console.log(formatData);
  if (data) {
    let count: number = 0;
    for (let i = 0; i < data.length; i++) {
      if (
        formatData.some(
          (dataFormat: any) => dataFormat.key === data[i]["Menu"].id
        )
      )
        continue;
      for (let j = 0; j < data.length; j++) {
        if (data[i]["Menu"].id === data[j]["Menu"].id) {
          count++;
        }
        if (j === data.length - 1) {
          formatData.push({
            ...dataMenuColumns.get(data[i]["Menu"].food),
            value: count,
          });
          count = 0;
        }
      }
    }
    dataMenuColumns.keys().forEach((key: string) => {
      if (!formatData.some((object: any) => object.label === key)) {
        formatData.push({ ...dataMenuColumns.get(key), value: 0 });
      }
    });
    formatData.sort((a, b) => b.value - a.value);
  }
  return formatData.length > 0 ? createColumns(formatData) : [];
}

// function animationCharts<T>(ref: T | null) {

// }

function createColumns(formatData: any) {
  let columns: any = [];
  formatData.forEach((data: any) => {
    columns.push({ ...data });
  });
  return columns;
}

export default function ModalChart() {
  let teste = useRef<View>(null);

  let [loading, setLoading] = useState(false);
  let [widthView, setWidthView] = useState(0);
  let [dataFood, setDataFood] = useState<any>([]);
  let [dataX, setDataX] = useState<any>();
  let [dataLabels, setDataLabels] = useState<any>();
  let [dataY, setDataY] = useState<any>();
  let [maxY, setMaxY] = useState<any>();

  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [mode, setMode] = useState<Module>("date");

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowPicker(Platform.OS === "ios");
    if (currentDate) {
      setDate(currentDate);
    }
  };

  const showDatePicker = (currentMode: Mode) => {
    setShowPicker(true);
    setMode(currentMode);
  };

  const unravelObjectList = (
    objects: Record<any, any>[],
    ...keys: string[]
  ) => {
    let listObject = objects.map((object: any) => {
      let newObject: Record<any, any> = {};
      for (let key of keys) {
        newObject[key] = object[key];
      }
      return newObject;
    });
    return listObject;
  };

  const [animationActive, setAnimationActive] = useState(true);

  const loadData = async () => {
    const foodsTemplate = await getFoods();
    setDataFood([...unravelObjectList(foodsTemplate, "key", "value")]);
    setDataX(
      unravelObjectList(foodsTemplate, "key").map(
        (object: any) => Object.values(object)[0]
      )
    );
    setDataLabels(
      unravelObjectList(foodsTemplate, "label").map(
        (object: any) => Object.values(object)[0]
      )
    );
    setTimeout(() => console.log(dataX, dataFood, dataLabels), 1000);
  };

  const hanldeWithView = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setWidthView(width);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Animated.ScrollView
      entering={SlideInRight}
      contentContainerStyle={styles.container}
    >
      <DateTimePicker
        value={date}
        mode="date"
        display={Platform.OS === "android" ? "calendar" : "inline"}
        onChange={onChange}
        minimumDate={new Date(1950, 0, 1)}
        maximumDate={new Date()}
        locale="pt-BR"
        textColor="#333" // Android apenas
        themeVariant="light" // iOS apenas
      />
      {/* <Link href={"/"} asChild>
        <Pressable style={StyleSheet.absoluteFill} />
      </Link> */}
      <View onLayout={hanldeWithView} style={styles.containerChart}>
        <View style={styles.buttonContainer}>
          <Button
            title="Selecionar Data"
            onPress={() => showDatePicker("date")}
            color="#2196F3"
          />
          <Button
            title="Selecionar Hora"
            onPress={() => showDatePicker("time")}
            color="#4CAF50"
          />
        </View>
        <View>
          <Text style={styles.selectedDate}>
            Data: {date.toLocaleDateString("pt-BR")}
          </Text>
          <Text style={styles.selectedTime}>
            Hora: {date.toLocaleTimeString("pt-BR")}
          </Text>
        </View>
        {(() => {
          if (!loading) {
            return (
              <>
                <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
                  <VictoryAxis tickValues={dataX} tickFormat={dataLabels} />
                  <VictoryAxis
                    dependentAxis
                    // tickFormat={(x) => `$${x / 1000}k`}
                  />
                  <VictoryBar
                    data={dataFood}
                    x="key"
                    y="value"
                    animate={{
                      // onLoad: { duration: 3000 }, // Animação inicial
                      onExit: { duration: 500 }, // Animação ao remover dados
                      onEnter: { duration: 500 }, // Animação ao adicionar dados
                    }}
                    style={{
                      data: {
                        fill: ({ datum }) =>
                          datum.value > 15000 ? "#4CAF50" : "#FF5722",
                        width: 20,
                      },
                    }}
                  />
                </VictoryChart>

                <Button
                  title={
                    animationActive ? "Desativar Animação" : "Ativar Animação"
                  }
                  onPress={() => setAnimationActive(!animationActive)}
                  color="#9C27B0"
                />
                <SegmentedControl
                  tabStyle={{ padding: 10 }}
                  appearance={"light"}
                  onValueChange={(value) => console.log(value)}
                  values={["Anterior", "Próximo"]}
                ></SegmentedControl>
              </>
            );
          } else {
            return (
              <>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ fontWeight: "bold" }}>Carregando Gráfico</Text>
              </>
            );
          }
        })()}
      </View>
      {/* <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Modal Screen</Text> */}
      {/* <Link href="/explore"></Link> */}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  containerChart: {
    // Mimic the card style from the image
    width: "90%",
    backgroundColor: "#ffffff", // Card background
    borderRadius: 16, // Rounded corners
    paddingVertical: 16, // Vertical padding inside the card
    paddingHorizontal: 8, // Horizontal padding inside the card
    marginVertical: 10, // Margin around the card
    marginHorizontal: 10, // Margin around the card
    alignItems: "center", // Center chart horizontally
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    // Android Shadow
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  container: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    backgroundColor: "#ffff",
    gap: 20,
  },
  selectedDate: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  selectedTime: {
    fontSize: 16,
    color: "#333",
  },
});
