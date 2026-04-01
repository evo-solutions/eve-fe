"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Input, Switch, Tabs, Table, Button, Drawer, Form, Space } from "antd";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { shopsService } from "@/services/shops.service";
import { productsService, type ProductItem } from "@/services/products.service";
import { faqsService, type FaqItem } from "@/services/faqs.service";

export default function ShopDetailPage() {
  const params = useParams<{ id: string }>();
  const shopId = params.id;
  const [productSearch, setProductSearch] = useState("");
  const debouncedProductSearch = useDebouncedValue(productSearch, 350);
  const [faqSearch, setFaqSearch] = useState("");
  const debouncedFaqSearch = useDebouncedValue(faqSearch, 350);
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [faqDrawerOpen, setFaqDrawerOpen] = useState(false);
  const [productForm] = Form.useForm();
  const [faqForm] = Form.useForm();
  const queryClient = useQueryClient();
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductItem | null>(null);
  const [productDetailForm] = Form.useForm();
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [faqDetailOpen, setFaqDetailOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<FaqItem | null>(null);
  const [faqDetailForm] = Form.useForm();
  const [selectedFaqIds, setSelectedFaqIds] = useState<string[]>([]);
  const tCommon = useTranslations("common");
  const tShopDetail = useTranslations("shopDetail");
  const tProducts = useTranslations("shopDetail.products");
  const tFaqs = useTranslations("shopDetail.faqs");

  const refetchAllShopFaqLists = () =>
    queryClient.refetchQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) &&
        q.queryKey[0] === "shop-faqs" &&
        q.queryKey[1] === shopId,
    });

  const shopQuery = useQuery({
    queryKey: ["shop-detail", shopId],
    queryFn: () => shopsService.detail(shopId),
    enabled: !!shopId,
  });

  const productsQuery = useQuery({
    queryKey: ["shop-products", shopId, debouncedProductSearch],
    queryFn: ({ signal }) =>
      productsService.list({
        shopId,
        limit: 100,
        search: debouncedProductSearch || undefined,
        signal,
      }),
    enabled: !!shopId,
  });

  const faqsQuery = useQuery({
    queryKey: ["shop-faqs", shopId, debouncedFaqSearch],
    queryFn: ({ signal }) =>
      faqsService.list({
        shopId,
        limit: 100,
        search: debouncedFaqSearch || undefined,
        signal,
      }),
    enabled: !!shopId,
  });

  const products = productsQuery.data ?? [];
  const faqs = faqsQuery.data ?? [];

  const createProductsMutation = useMutation({
    mutationFn: productsService.createMany,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shop-products", shopId] });
      setProductDrawerOpen(false);
      productForm.resetFields();
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      data: {
        name?: string;
        price?: number;
        thumbnailUrl?: string;
        imageUrls?: string[];
        searchContent?: string;
        isActive?: boolean;
      };
    }) => productsService.update(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shop-products", shopId] });
      setProductDetailOpen(false);
      setCurrentProduct(null);
      productDetailForm.resetFields();
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shop-products", shopId] });
      setProductDetailOpen(false);
      setCurrentProduct(null);
      productDetailForm.resetFields();
    },
  });

  const deleteManyProductsMutation = useMutation({
    mutationFn: (ids: string[]) => productsService.deleteMany(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shop-products", shopId] });
      setSelectedProductIds([]);
    },
  });

  const createFaqsMutation = useMutation({
    mutationFn: faqsService.createMany,
    onSuccess: async () => {
      await refetchAllShopFaqLists();
      setFaqDrawerOpen(false);
      faqForm.resetFields();
    },
  });

  const updateFaqMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      data: { question?: string; answer?: string; isActive?: boolean };
    }) => faqsService.update(payload.id, payload.data),
    onSuccess: async (updated) => {
      queryClient.setQueriesData<FaqItem[]>(
        {
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === "shop-faqs" &&
            q.queryKey[1] === shopId,
        },
        (old) => {
          if (!old) return old;
          return old.map((f) => (f.id === updated.id ? { ...f, ...updated } : f));
        },
      );
      await refetchAllShopFaqLists();
      setFaqDetailOpen(false);
      setCurrentFaq(null);
      faqDetailForm.resetFields();
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (id: string) => faqsService.delete(id),
    onSuccess: async () => {
      await refetchAllShopFaqLists();
      setFaqDetailOpen(false);
      setCurrentFaq(null);
      faqDetailForm.resetFields();
    },
  });

  const deleteManyFaqsMutation = useMutation({
    mutationFn: (ids: string[]) => faqsService.deleteMany(ids),
    onSuccess: async () => {
      await refetchAllShopFaqLists();
      setSelectedFaqIds([]);
    },
  });

  return (
    <AuthGuard>
      <div className="p-4 md:p-6">
        <Card
          title={tShopDetail("title", { name: shopQuery.data?.name ?? shopId })}
          extra={
            <Link href={`/shops/${shopId}/chat`}>
              <Button type="default">{tShopDetail("goToChat")}</Button>
            </Link>
          }
        >
          <Tabs
            items={[
              {
                key: "products",
                label: tShopDetail("productsTab"),
                children: (
                  <div>
                    <div className="mb-4 flex gap-3 items-center">
                      <Input.Search
                        allowClear
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder={tProducts("searchPlaceholder")}
                      />
                      <Button type="primary" onClick={() => setProductDrawerOpen(true)}>
                        {tProducts("add")}
                      </Button>
                      <Button
                        danger
                        disabled={!selectedProductIds.length}
                        loading={deleteManyProductsMutation.isPending}
                        onClick={() => {
                          if (!selectedProductIds.length) return;
                          deleteManyProductsMutation.mutate(selectedProductIds);
                        }}
                      >
                        {tCommon("deleteSelected")}
                      </Button>
                    </div>
                    {productsQuery.isFetching ? (
                      <TableSkeleton
                        columns={[
                          { title: tCommon("name") },
                          { title: tProducts("price") },
                          { title: tCommon("searchContent") },
                          { title: tCommon("status") },
                          { title: tCommon("actions") },
                        ]}
                      />
                    ) : (
                      <Table<ProductItem>
                        rowKey="id"
                        dataSource={products}
                        pagination={{ pageSize: 10 }}
                        rowSelection={{
                          selectedRowKeys: selectedProductIds,
                          onChange: (keys) => setSelectedProductIds(keys as string[]),
                        }}
                        columns={[
                          { title: tCommon("name"), dataIndex: "name" },
                          { title: tProducts("price"), dataIndex: "price" },
                          {
                            title: tCommon("searchContent"),
                            dataIndex: "searchContent",
                            ellipsis: true,
                            render: (value?: string | null) => value || "-",
                          },
                          {
                            title: tCommon("status"),
                            dataIndex: "isActive",
                            render: (value: boolean) => (
                              <span className={value ? "text-green-600" : "text-red-500"}>
                                {value ? tCommon("active") : tCommon("inactive")}
                              </span>
                            ),
                          },
                          {
                            title: tCommon("actions"),
                            key: "actions",
                            render: (_, product) => (
                              <Button
                                size="small"
                                onClick={() => {
                                  setCurrentProduct(product);
                                  productDetailForm.setFieldsValue({
                                    name: product.name,
                                    price: product.price,
                                    thumbnailUrl: product.thumbnailUrl || "",
                                    imageUrlsText: (product.imageUrls || []).join(", "),
                                    searchContent: product.searchContent || "",
                                    isActive: product.isActive,
                                  });
                                  setProductDetailOpen(true);
                                }}
                              >
                                {tCommon("detail")}
                              </Button>
                            ),
                          },
                        ]}
                      />
                    )}
                  </div>
                ),
              },
              {
                key: "faqs",
                label: tShopDetail("faqsTab"),
                children: (
                  <div>
                    <div className="mb-4 flex gap-3 items-center">
                      <Input.Search
                        allowClear
                        value={faqSearch}
                        onChange={(e) => setFaqSearch(e.target.value)}
                        placeholder={tFaqs("searchPlaceholder")}
                      />
                      <Button type="primary" onClick={() => setFaqDrawerOpen(true)}>
                        {tFaqs("add")}
                      </Button>
                      <Button
                        danger
                        disabled={!selectedFaqIds.length}
                        loading={deleteManyFaqsMutation.isPending}
                        onClick={() => {
                          if (!selectedFaqIds.length) return;
                          deleteManyFaqsMutation.mutate(selectedFaqIds);
                        }}
                      >
                        {tCommon("deleteSelected")}
                      </Button>
                    </div>
                    {faqsQuery.isFetching ? (
                      <TableSkeleton
                        columns={[
                          { title: tFaqs("question") },
                          { title: tFaqs("answer") },
                          { title: tCommon("status") },
                          { title: tCommon("actions") },
                        ]}
                      />
                    ) : (
                      <Table<FaqItem>
                        rowKey="id"
                        dataSource={faqs}
                        pagination={{ pageSize: 10 }}
                        rowSelection={{
                          selectedRowKeys: selectedFaqIds,
                          onChange: (keys) => setSelectedFaqIds(keys as string[]),
                        }}
                        columns={[
                          { title: tFaqs("question"), dataIndex: "question" },
                          {
                            title: tFaqs("answer"),
                            dataIndex: "answer",
                            ellipsis: true,
                          },
                          {
                            title: tCommon("status"),
                            dataIndex: "isActive",
                            render: (value: boolean) => (
                              <span className={value ? "text-green-600" : "text-red-500"}>
                                {value ? tCommon("active") : tCommon("inactive")}
                              </span>
                            ),
                          },
                          {
                            title: tCommon("actions"),
                            key: "actions",
                            render: (_, faq) => (
                              <Button
                                size="small"
                                onClick={() => {
                                  setCurrentFaq(faq);
                                  faqDetailForm.setFieldsValue({
                                    question: faq.question,
                                    answer: faq.answer,
                                    isActive: faq.isActive,
                                  });
                                  setFaqDetailOpen(true);
                                }}
                              >
                                {tCommon("detail")}
                              </Button>
                            ),
                          },
                        ]}
                      />
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Card>

        <Drawer
          title={tProducts("drawerAddTitle")}
          placement="left"
          size="large"
          open={productDrawerOpen}
          onClose={() => setProductDrawerOpen(false)}
          destroyOnClose
        >
          <Form
            form={productForm}
            layout="vertical"
            initialValues={{
              items: [
                {
                  name: "",
                  price: 0,
                  thumbnailUrl: "",
                  imageUrlsText: "",
                  searchContent: "",
                  isActive: true,
                },
              ],
            }}
            onFinish={(values: {
              items: {
                name: string;
                price: number;
                thumbnailUrl?: string;
                imageUrlsText?: string;
                searchContent?: string;
                isActive?: boolean;
              }[];
            }) =>
              createProductsMutation.mutate(
                values.items.map((item) => {
                  const raw = item.imageUrlsText || "";
                  const imageUrls = raw
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  return {
                    shopId,
                    name: item.name,
                    price: Number(item.price) || 0,
                    thumbnailUrl: item.thumbnailUrl || undefined,
                    imageUrls: imageUrls.length ? imageUrls : undefined,
                    searchContent: item.searchContent || undefined,
                    isActive: item.isActive,
                  };
                }),
              )
            }
          >
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  <Space orientation="vertical" style={{ width: "100%" }}>
                    {fields.map((field, index) => (
                      <Card
                        key={field.key}
                        size="small"
                        title={tProducts("productN", { index: index + 1 })}
                        extra={
                          fields.length > 1 ? (
                            <Button size="small" danger onClick={() => remove(field.name)}>
                              {tCommon("remove")}
                            </Button>
                          ) : null
                        }
                      >
                        <Form.Item
                          label={tCommon("name")}
                          name={[field.name, "name"]}
                          rules={[{ required: true, message: tProducts("form.nameRequired") }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label={tProducts("price")}
                          name={[field.name, "price"]}
                          rules={[{ required: true, message: tProducts("form.priceRequired") }]}
                        >
                          <Input type="number" min={0} />
                        </Form.Item>
                        <Form.Item label={tProducts("thumbnailUrl")} name={[field.name, "thumbnailUrl"]}>
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label={tProducts("imageUrlsComma")}
                          name={[field.name, "imageUrlsText"]}
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item label={tCommon("searchContent")} name={[field.name, "searchContent"]}>
                          <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item
                          label={tCommon("active")}
                          name={[field.name, "isActive"]}
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Card>
                    ))}
                  </Space>
                  <Button
                    type="dashed"
                    className="mt-3 w-full"
                    onClick={() =>
                      add({
                        name: "",
                        price: 0,
                        thumbnailUrl: "",
                        imageUrlsText: "",
                        searchContent: "",
                        isActive: true,
                      })
                    }
                  >
                    {tProducts("addAnother")}
                  </Button>
                </>
              )}
            </Form.List>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setProductDrawerOpen(false)}>{tCommon("cancel")}</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createProductsMutation.isPending}
              >
                {tCommon("save")}
              </Button>
            </div>
          </Form>
        </Drawer>

        <Drawer
          title={
            currentProduct
              ? tProducts("drawerDetailTitle", { name: currentProduct.name })
              : tProducts("drawerDetailFallbackTitle")
          }
          placement="left"
          size="large"
          open={productDetailOpen}
          onClose={() => {
            setProductDetailOpen(false);
            setCurrentProduct(null);
            productDetailForm.resetFields();
          }}
          destroyOnClose
        >
          <Form
            form={productDetailForm}
            layout="vertical"
            onFinish={(values: {
              name: string;
              price: number;
              thumbnailUrl?: string;
              imageUrlsText?: string;
              searchContent?: string;
              isActive?: boolean;
            }) => {
              if (!currentProduct) return;
              const raw = values.imageUrlsText || "";
              const imageUrls = raw
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              updateProductMutation.mutate({
                id: currentProduct.id,
                data: {
                  name: values.name,
                  price: Number(values.price) || 0,
                  thumbnailUrl: values.thumbnailUrl || undefined,
                  imageUrls: imageUrls.length ? imageUrls : undefined,
                  searchContent: values.searchContent || undefined,
                  isActive: values.isActive,
                },
              });
            }}
          >
            <Form.Item
              label={tCommon("name")}
              name="name"
              rules={[{ required: true, message: tProducts("form.nameRequired") }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={tProducts("price")}
              name="price"
              rules={[{ required: true, message: tProducts("form.priceRequired") }]}
            >
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item label={tProducts("thumbnailUrl")} name="thumbnailUrl">
              <Input />
            </Form.Item>
            <Form.Item label={tProducts("imageUrlsComma")} name="imageUrlsText">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item label={tCommon("searchContent")} name="searchContent">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item label={tCommon("active")} name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>

            <div className="mt-6 flex justify-between gap-2">
              <Button
                danger
                loading={deleteProductMutation.isPending}
                onClick={() => {
                  if (!currentProduct) return;
                  deleteProductMutation.mutate(currentProduct.id);
                }}
              >
                {tProducts("deleteThis")}
              </Button>
              <Space>
                <Button
                  onClick={() => {
                    setProductDetailOpen(false);
                    setCurrentProduct(null);
                    productDetailForm.resetFields();
                  }}
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateProductMutation.isPending}
                >
                  {tCommon("saveChanges")}
                </Button>
              </Space>
            </div>
          </Form>
        </Drawer>

        <Drawer
          title={tFaqs("drawerAddTitle")}
          placement="left"
          size="large"
          open={faqDrawerOpen}
          onClose={() => setFaqDrawerOpen(false)}
          destroyOnClose
        >
          <Form
            form={faqForm}
            layout="vertical"
            initialValues={{
              items: [{ question: "", answer: "", isActive: true }],
            }}
            onFinish={(values: {
              items: {
                question: string;
                answer: string;
                isActive?: boolean;
              }[];
            }) =>
              createFaqsMutation.mutate(
                values.items.map((item) => ({
                  shopId,
                  question: item.question,
                  answer: item.answer,
                  isActive: item.isActive,
                })),
              )
            }
          >
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  <Space orientation="vertical" style={{ width: "100%" }}>
                    {fields.map((field, index) => (
                      <Card
                        key={field.key}
                        size="small"
                        title={tFaqs("faqN", { index: index + 1 })}
                        extra={
                          fields.length > 1 ? (
                            <Button size="small" danger onClick={() => remove(field.name)}>
                              {tCommon("remove")}
                            </Button>
                          ) : null
                        }
                      >
                        <Form.Item
                          label={tFaqs("question")}
                          name={[field.name, "question"]}
                          rules={[{ required: true, message: tFaqs("form.questionRequired") }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label={tFaqs("answer")}
                          name={[field.name, "answer"]}
                          rules={[{ required: true, message: tFaqs("form.answerRequired") }]}
                        >
                          <Input.TextArea rows={3} />
                        </Form.Item>
                        <Form.Item
                          label={tCommon("active")}
                          name={[field.name, "isActive"]}
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Card>
                    ))}
                  </Space>
                  <Button
                    type="dashed"
                    className="mt-3 w-full"
                    onClick={() =>
                      add({
                        question: "",
                        answer: "",
                        isActive: true,
                      })
                    }
                  >
                    {tFaqs("addAnother")}
                  </Button>
                </>
              )}
            </Form.List>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setFaqDrawerOpen(false)}>{tCommon("cancel")}</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createFaqsMutation.isPending}
              >
                {tCommon("save")}
              </Button>
            </div>
          </Form>
        </Drawer>

        <Drawer
          title={tFaqs("drawerDetailTitle")}
          placement="left"
          size="large"
          open={faqDetailOpen}
          onClose={() => {
            setFaqDetailOpen(false);
            setCurrentFaq(null);
            faqDetailForm.resetFields();
          }}
          destroyOnClose
        >
          <Form
            form={faqDetailForm}
            layout="vertical"
            onFinish={(values: {
              question: string;
              answer: string;
              isActive?: boolean;
            }) => {
              if (!currentFaq) return;
              updateFaqMutation.mutate({
                id: currentFaq.id,
                data: {
                  question: values.question,
                  answer: values.answer,
                  isActive: values.isActive,
                },
              });
            }}
          >
            <Form.Item
              label={tFaqs("question")}
              name="question"
              rules={[{ required: true, message: tFaqs("form.questionRequired") }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={tFaqs("answer")}
              name="answer"
              rules={[{ required: true, message: tFaqs("form.answerRequired") }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label={tCommon("active")} name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>

            <div className="mt-6 flex justify-between gap-2">
              <Button
                danger
                loading={deleteFaqMutation.isPending}
                onClick={() => {
                  if (!currentFaq) return;
                  deleteFaqMutation.mutate(currentFaq.id);
                }}
              >
                {tFaqs("deleteThis")}
              </Button>
              <Space>
                <Button
                  onClick={() => {
                    setFaqDetailOpen(false);
                    setCurrentFaq(null);
                    faqDetailForm.resetFields();
                  }}
                >
                  {tCommon("cancel")}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateFaqMutation.isPending}
                >
                  {tCommon("saveChanges")}
                </Button>
              </Space>
            </div>
          </Form>
        </Drawer>
      </div>
    </AuthGuard>
  );
}
