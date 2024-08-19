/*
 * Copyright 2017-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { h, ComponentConstructor, JSX } from 'preact';

type JsxFactory<PropsType> = (params?: PropsType, ...children: (JSX.Element | JSX.Element[] | string)[]) => JSX.Element;

export function createPreactFactory<PropsType, StateType = any>(
  component: ComponentConstructor<PropsType, StateType> | string,
): JsxFactory<PropsType> {
  return (params?: PropsType, ...children: (JSX.Element | JSX.Element[] | string)[]) =>
    h(component as any, params!, ...children);
}

export const div = createPreactFactory('div');
export const span = createPreactFactory('span');
export const button = createPreactFactory('button');
export const h1 = createPreactFactory('h1');
export const p = createPreactFactory('p');
export const form = createPreactFactory('form');
export const a = createPreactFactory('a');
export const input = createPreactFactory('input');
export const textarea = createPreactFactory('textarea');

export function classNames(...args: ({ [className: string]: boolean | undefined } | string | undefined)[]) {
  const classes: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg) {
      continue;
    }

    if ('string' === typeof arg) {
      classes.push(arg);
    } else if ('object' === typeof arg) {
      for (const key in arg) {
        // eslint-disable-next-line no-prototype-builtins
        if (arg.hasOwnProperty(key) && arg[key]) {
          classes.push(key);
        }
      }
    }
  }
  return classes.join(' ');
}
