import { useState } from "react";
import { VStack } from "native-base";
import { Alert } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

import { Header } from "../components/Header";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { ValidationMessage } from "../components/ValidationMessage";

type RegisterFormData = {
    patrimony: string;
    description: string;
}

const schema = yup.object({
    patrimony: yup
        .string()
        .required("Informe um patrimônio."),
    description: yup
        .string()
        .required("Informe uma descrição.")
})

export function Register() {
    const [isLoading, setIsloading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const navigation = useNavigation();

    function handleNewOrderRegister(data: RegisterFormData) {

        setIsloading(true);

        firestore()
            .collection("orders")
            .add({
                patrimony: data.patrimony,
                description: data.description,
                status: "open",
                created_at: firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                Alert.alert("Solicitação", "Solicitação registrada com sucesso.");
                navigation.goBack();
            })
            .catch(error => {
                console.log(error);
                setIsloading(false);
                return Alert.alert("Solicitação", "Não foi possível registrar a solicitação.")
            })
    }

    return (
        <VStack flex={1} bg="gray.600">
            <Header title="Solicitação" />

            <VStack flex={1} pl={6} pr={6} pb={6}>
                <VStack mt={4} w="full">
                    <Controller
                        name="patrimony"
                        control={control}
                        render={({ field }) => (
                            <Input
                                placeholder="Número do patrimônio"
                                onBlur={field.onBlur}
                                onChangeText={(val) => field.onChange(val)}
                                value={field.value}
                            />
                        )}
                    />
                    {errors.patrimony?.message && <ValidationMessage message={errors.patrimony?.message as string} mt={1} />}
                </VStack>

                <VStack mt={5} flex={1}>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <Input
                                flex={1}
                                multiline
                                textAlignVertical="top"
                                placeholder="Descrição do problema"
                                onBlur={field.onBlur}
                                onChangeText={(val) => field.onChange(val)}
                                value={field.value}
                            />
                        )}
                    />
                    {errors.description?.message && <ValidationMessage message={errors.description?.message as string} mt={1} />}
                </VStack>

                <Button
                    title="Cadastrar"
                    mt={5}
                    isLoading={isLoading}
                    onPress={handleSubmit(handleNewOrderRegister)}
                />
            </VStack>
        </VStack>
    );
}