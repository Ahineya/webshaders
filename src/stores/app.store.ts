import {StoreSubject} from "../helpers/store-subject";

import templateShader from '../shaders/cemetery.frag';

class AppStore {
    public fragmentShader = new StoreSubject(templateShader);
}

export const appStore = new AppStore();
