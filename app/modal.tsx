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
  TextInput,
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
  let dataMenuColumns: Record<string,any> = {}; // Objeto TS substituindo o Map
  let response = (await supabase.from("Menu").select(`id, food`)) as any;
  let dataMenu: any = response.data;
  
  dataMenu.forEach((menu: any) => {
    dataMenuColumns[menu.food] = { // Atribuição direta no objeto
      key: menu.id,
      label: menu.food,
    };
  });

  let { data, error } = (await supabase.from("Order").select(`
    Menu!food (id, food)
  `)) as any;

  if (data) {
    let count: number = 0;
    for (let i = 0; i < data.length; i++) {
      if (
        formatData.some(
          (dataFormat: any) => dataFormat.key === data[i]["Menu"].id
        )
      ) continue;

      for (let j = 0; j < data.length; j++) {
        if (data[i]["Menu"].id === data[j]["Menu"].id) {
          count++;
        }
        if (j === data.length - 1) {
          formatData.push({
            ...dataMenuColumns[data[i]["Menu"].food], // Acesso direto via propriedade
            value: count,
          });
          count = 0;
        }
      }
    }

    // Iterar pelas chaves do objeto
    Object.keys(dataMenuColumns).forEach((key: string) => {
      if (!formatData.some((object: any) => object.label === key)) {
        formatData.push({ ...dataMenuColumns[key], value: 0 });
      }
    });

    formatData.sort((a, b) => b.value - a.value);
  }

  return formatData.length > 0 ? createColumns(formatData) : [];
}

function createColumns(formatData: any) {
  let columns: any = [];
  formatData.forEach((data: any) => {
    columns.push({ ...data });
  });
  return columns;
}

export default function ModalChart() {
  let teste = useRef<View>(null);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  let [loading, setLoading] = useState(false);
  let [widthView, setWidthView] = useState(0);
  let [dataFood, setDataFood] = useState<any>([]);
  let [dataX, setDataX] = useState<any>();
  let [dataLabels, setDataLabels] = useState<any>();
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [mode, setMode] = useState<Module>("date");

  const handleStartDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowStartPicker(false);
    if (date) {
      setStartDate(date);
      if (date > endDate) {
        setEndDate(date);
      }
    }
  };

  const handleEndDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowEndPicker(false);
    if (date && date >= startDate) {
      setEndDate(date);
    }
  };

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
    console.log(dataX, dataFood, dataLabels);
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
      <View onLayout={hanldeWithView} style={styles.containerChart}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 20,
          }}
        >
          <View style={styles.pickerContainer}>
            <Text
              style={styles.dateText}
              onPress={() => setShowStartPicker(true)}
            >
              De: {startDate.toLocaleDateString("pt-BR")}
            </Text>

            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === "android" ? "calendar" : "inline"}
                onChange={handleStartDateChange}
                minimumDate={new Date(1950, 0, 1)}
                maximumDate={endDate}
                locale="pt-BR"
                themeVariant="light"
              />
            )}
          </View>
          <View style={styles.pickerContainer}>
            <Text
              style={styles.dateText}
              onPress={() => setShowEndPicker(true)}
            >
              Até: {endDate.toLocaleDateString("pt-BR")}
            </Text>

            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === "android" ? "calendar" : "inline"}
                onChange={handleEndDateChange}
                minimumDate={startDate}
                maximumDate={new Date()}
                locale="pt-BR"
                themeVariant="light"
              />
            )}
          </View>
        </View>
        {(() => {
          if (!loading) {
            return (
              <>
                <VictoryChart theme={VictoryTheme.material} domainPadding={20} animate={{duration:1000}}>
                  <VictoryAxis tickValues={dataX} tickFormat={dataLabels} />
                  <VictoryAxis
                    dependentAxis
                  />
                  <VictoryBar
                    data={dataFood}
                    x="key"
                    y="value"
                    style={{
                      data: {
                        fill: ({ datum }) =>
                          datum.value > 15000 ? "#4CAF50" : "#FF5722",
                        width: 20,
                      },
                    }}
                  />
                </VictoryChart>

                <View style={{display:"flex",flexDirection:"row", justifyContent:"space-between", width:"100%", paddingHorizontal:30}}>
                  <Button title="Anterior"></Button>
                  <Button title="Próximo"></Button>
                </View>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
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
  pickerContainer: {
    marginVertical: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#2196F3",
    padding: 10,
    borderWidth: 1,
    borderColor: "#2196F3",
    borderRadius: 5,
  },
});
