import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Pager from '../../src/components/Pager.vue';

describe('ComponentName.vue', () => {

  it('should render correctly', () => {
    const wrapper = mount(Pager, {
      props: {
        limit: 100,
        length: 10,
        perPage: 10,
        page: 1,
      }
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('should compute max correctly', () => {
    const wrapper = mount(Pager, {
      props: {
        limit: 100,
        length: 10,
        perPage: 10,
        page: 1
      }
    });

    /* @ts-ignore */
    expect(wrapper.vm.max).toBe(10);
  });

  it('should emit changePage event', async () => {
    const wrapper = mount(Pager, {
      props: {
        limit: 100,
        length: 10,
        perPage: 10,
        page: 1
      }
    });

    wrapper.vm.$emit('changePage', 2);
    expect(wrapper.emitted('changePage')).toBeTruthy();
    expect(wrapper.emitted('changePage')?.[0]).toEqual([2]);
  });

  it('should emit changePerPage event', async () => {
    const wrapper = mount(Pager, {
      props: {
        limit: 100,
        length: 10,
        perPage: 10,
        page: 1
      }
    });

    wrapper.vm.$emit('changePerPage', { label: '20', value: 20 });
    expect(wrapper.emitted('changePerPage')).toBeTruthy();
    expect(wrapper.emitted('changePerPage')?.[0]).toEqual([{ label: '20', value: 20 }]);
  });

  it('should display correct length and limit', () => {
    const wrapper = mount(Pager, {
      props: {
        limit: 100,
        length: 10,
        perPage: 10,
        page: 1
      }
    });

    expect(wrapper.find('.text-caption').text()).toContain('10 Cuentas de 100');
  });

  it('should update rowsPerPage correctly', async () => {
    const wrapper = mount(Pager, {
      props: {
        limit: 100,
        length: 10,
        perPage: 10,
        page: 1
      }
    });

    const select = wrapper.findComponent({ name: 'q-select' });

    await select.vm.$emit('update:modelValue', { label: '20', value: 20 });
    /* @ts-ignore */
    expect(wrapper.vm.rowsPerPage).toEqual({ label: '20', value: 20 });
  });
});
