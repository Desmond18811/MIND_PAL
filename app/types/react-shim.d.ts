import 'react';

declare global {
    namespace JSX {
        // Override the expected component class type to be permissive
        interface ElementClass {
            render?: any;
            context?: any;
            setState?: any;
            forceUpdate?: any;
            props?: any;
            refs?: any;
        }

        // Define how props are determined from the element class
        interface ElementAttributesProperty {
            props: any;
        }

        // Define implicit children
        interface ElementChildrenAttribute {
            children: any;
        }

        // Force element types to be permissive
        type ElementType = any;
    }
}
