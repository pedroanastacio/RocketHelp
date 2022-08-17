import { useState } from "react";
import { Alert } from "react-native";
import { VStack, Heading, Icon, useTheme } from "native-base";
import { Envelope, Key } from "phosphor-react-native";
import auth from "@react-native-firebase/auth";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { ValidationMessage } from "../components/ValidationMessage";

import Logo from "../assets/logo_primary.svg";

type SignInFormData = {
    email: string;
    password: string;
}

const schema = yup.object({
    email: yup
        .string()
        .email("E-mail inválido")
        .required("Informe um e-mail."),
    password: yup
        .string()
        .min(6, "A senha deve ter pelo menos 6 caracteres")
        .required("Informe uma senha.")
})

export function SignIn() {
    const [isLoading, setIsloading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const { colors } = useTheme();

    function handleSignIn(data: SignInFormData) {
        setIsloading(true);

        auth().signInWithEmailAndPassword(data.email, data.password)
            .catch((error) => {
                console.log(error);
                setIsloading(false);

                if (error.code === "auth/invalid-email") {
                    return Alert.alert("Entrar", "E-mail inválido.")
                }

                if (error.code === "auth/wrong-password") {
                    return Alert.alert("Entrar", "E-mail ou senha inválida.")
                }

                if (error.code === "auth/user-not-found") {
                    return Alert.alert("Entrar", "E-mail ou senha inválida.")
                }

                return Alert.alert("Entrar", "Não foi possível acessar");
            });
    }

    return (
        <VStack flex={1} alignItems="center" bg="gray.600" px={8} pt={24}>
            <Logo />

            <Heading color="gray.100" fontSize="xl" mt={20} mb={6}>
                Acesse sua conta
            </Heading>

            <VStack mb={4} w="full">
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <Input
                            InputLeftElement={<Icon as={<Envelope color={colors.gray[300]} style={{ marginLeft: 16 }} />} />}
                            placeholder="E-mail"
                            onBlur={field.onBlur}
                            onChangeText={(val) => field.onChange(val)}
                            value={field.value}
                        />
                    )}
                />
                {errors.email?.message && <ValidationMessage message={errors.email?.message as string} mt={1} />}
            </VStack>

            <VStack mb={4} w="full">
                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <Input
                            InputLeftElement={<Icon as={<Key color={colors.gray[300]} style={{ marginLeft: 16 }} />} />}
                            placeholder="Senha"
                            secureTextEntry
                            onBlur={field.onBlur}
                            onChangeText={(val) => field.onChange(val)}
                            value={field.value}
                        />
                    )}
                />
                {errors.password?.message && <ValidationMessage message={errors.password?.message as string} mt={1} />}
            </VStack>

            <Button
                title="Entrar"
                w="full"
                onPress={handleSubmit(handleSignIn)}
                isLoading={isLoading}
            />
        </VStack>
    );
}