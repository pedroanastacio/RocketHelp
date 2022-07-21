import { Center } from "native-base";

import Logo from "../assets/logo_primary.svg";

export function SplashScreen() {
    return (
        <Center flex={1} bg="gray.700">
            <Logo />
        </Center>
    );
}