import {h, ComponentConstructor} from 'preact';

type JsxFactory<PropsType> = (params?: PropsType, ...children: (JSX.Element | JSX.Element[] | string)[]) => JSX.Element;

export function createPreactFactory<PropsType, StateType=any>(component: ComponentConstructor<PropsType, StateType> | string): JsxFactory<PropsType> {
  return (params?: PropsType, ...children: (JSX.Element | JSX.Element[] | string)[]) => h(component as any, params, ...children);
}

export const div = createPreactFactory('div');
export const span = createPreactFactory('div');
export const button = createPreactFactory('button');
export const h1 = createPreactFactory('h1');
export const p = createPreactFactory('p');

export function classNames(...args: ({ [className: string]: (boolean | undefined) } | string | undefined)[]) {
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
        if (arg.hasOwnProperty(key) && arg[key]) {
          classes.push(key);
        }
      }
    }
  }
  return classes.join(' ');
}