/**
 * Drawer component built on top of Emil Kowalski's Vaul library.
 * Provides native iOS-style bottom sheet behavior on the web with
 * drag gestures, snap points, and background scale effects.
 *
 * Styled to match the ElevateCv "Obsidian Emerald" design system.
 *
 * @see https://vaul.emilkowal.ski/
 */

import { Drawer as VaulDrawer } from "vaul";

const Drawer = ({
  children,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Root>) => (
  <VaulDrawer.Root shouldScaleBackground {...props}>
    {children}
  </VaulDrawer.Root>
);
Drawer.displayName = "Drawer";

const DrawerTrigger = VaulDrawer.Trigger;
const DrawerClose = VaulDrawer.Close;
const DrawerPortal = VaulDrawer.Portal;

const DrawerOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Overlay>) => (
  <VaulDrawer.Overlay
    className={`fixed inset-0 z-50 bg-black/60 ${className ?? ""}`}
    {...props}
  />
);
DrawerOverlay.displayName = "DrawerOverlay";

const DrawerContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Content>) => (
  <DrawerPortal>
    <DrawerOverlay />
    <VaulDrawer.Content
      className={`fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-2xl bg-[#161c1a] border-t border-[#1f2725] ${className ?? ""}`}
      {...props}
    >
      {/* Drag handle */}
      <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-gray-600" />
      {children}
    </VaulDrawer.Content>
  </DrawerPortal>
);
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`grid gap-1.5 p-4 text-center sm:text-left ${className ?? ""}`}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`mt-auto flex flex-col gap-2 p-4 ${className ?? ""}`}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Title>) => (
  <VaulDrawer.Title
    className={`text-lg font-semibold leading-none tracking-tight text-gray-100 ${className ?? ""}`}
    {...props}
  />
);
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof VaulDrawer.Description>) => (
  <VaulDrawer.Description
    className={`text-sm text-gray-400 ${className ?? ""}`}
    {...props}
  />
);
DrawerDescription.displayName = "DrawerDescription";

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerOverlay,
  DrawerPortal,
};
