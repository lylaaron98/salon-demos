/**
 * Editor UI for the `salon-booking-enquiry/enquiry-form` block. No build step: plain JS with the
 * wp.* globals. The front end is rendered in PHP (FormRenderer); the editor shows it live via
 * ServerSideRender.
 */
(function (wp) {
  "use strict";

  var el = wp.element.createElement;
  var __ = wp.i18n.__;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var useBlockProps = wp.blockEditor.useBlockProps;
  var PanelBody = wp.components.PanelBody;
  var SelectControl = wp.components.SelectControl;
  var TextControl = wp.components.TextControl;
  var ToggleControl = wp.components.ToggleControl;
  var CheckboxControl = wp.components.CheckboxControl;
  var ServerSideRender = wp.serverSideRender;
  var data = window.sbeBlockData || { brands: [], outlets: [], services: [] };

  /** Checkbox list for choosing a subset (empty selection = all). */
  function Picker(props) {
    var options = props.options.filter(function (o) {
      return o.brand === props.brand;
    });
    return el(
      "fieldset",
      { className: "sbe-block-picker" },
      el("legend", null, props.label),
      el(
        "p",
        { className: "components-base-control__help" },
        __("None ticked = all.", "salon-booking-enquiry"),
      ),
      options.map(function (option) {
        return el(CheckboxControl, {
          key: option.value,
          label: option.label,
          checked: props.value.indexOf(option.value) !== -1,
          onChange: function (checked) {
            var next = props.value.filter(function (v) {
              return v !== option.value;
            });
            if (checked) next.push(option.value);
            props.onChange(next);
          },
        });
      }),
    );
  }

  wp.blocks.registerBlockType("salon-booking-enquiry/enquiry-form", {
    edit: function (props) {
      var a = props.attributes;
      var set = props.setAttributes;
      return el(
        "div",
        useBlockProps(),
        el(
          InspectorControls,
          null,
          el(
            PanelBody,
            { title: __("Studio", "salon-booking-enquiry"), initialOpen: true },
            el(SelectControl, {
              label: __("Brand", "salon-booking-enquiry"),
              value: a.brand,
              options: data.brands,
              onChange: function (brand) {
                set({ brand: brand, outlets: [], services: [] });
              },
            }),
            el(Picker, {
              label: __("Outlets", "salon-booking-enquiry"),
              brand: a.brand,
              options: data.outlets,
              value: a.outlets,
              onChange: function (v) {
                set({ outlets: v });
              },
            }),
            el(Picker, {
              label: __("Services", "salon-booking-enquiry"),
              brand: a.brand,
              options: data.services,
              value: a.services,
              onChange: function (v) {
                set({ services: v });
              },
            }),
          ),
          el(
            PanelBody,
            { title: __("Form", "salon-booking-enquiry"), initialOpen: false },
            el(TextControl, {
              label: __("Heading", "salon-booking-enquiry"),
              value: a.heading,
              onChange: function (v) {
                set({ heading: v });
              },
            }),
            el(TextControl, {
              label: __("Intro", "salon-booking-enquiry"),
              value: a.intro,
              onChange: function (v) {
                set({ intro: v });
              },
            }),
            el(TextControl, {
              label: __("Submit button label", "salon-booking-enquiry"),
              value: a.submitLabel,
              onChange: function (v) {
                set({ submitLabel: v });
              },
            }),
            el(ToggleControl, {
              label: __("Ask for a date and time", "salon-booking-enquiry"),
              checked: a.showSchedule,
              onChange: function (v) {
                set({ showSchedule: v });
              },
            }),
            el(ToggleControl, {
              label: __("Ask for email (optional field)", "salon-booking-enquiry"),
              checked: a.askEmail,
              onChange: function (v) {
                set({ askEmail: v });
              },
            }),
            el(TextControl, {
              label: __("Form ID (analytics)", "salon-booking-enquiry"),
              value: a.formId,
              onChange: function (v) {
                set({ formId: v });
              },
            }),
          ),
        ),
        el(ServerSideRender, {
          block: "salon-booking-enquiry/enquiry-form",
          attributes: a,
        }),
      );
    },
    save: function () {
      return null;
    },
  });
})(window.wp);
