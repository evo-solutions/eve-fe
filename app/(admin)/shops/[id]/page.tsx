"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Input, Select, Tabs, Table, Button, Drawer, Form, Space } from "antd";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { shopsService } from "@/services/shops.service";
import { productsService, type ProductItem } from "@/services/products.service";
import { faqsService, type FaqItem } from "@/services/faqs.service";

export default function ShopDetailPage() {
  const params = useParams<{ id: string }>();
  const shopId = params.id;
  const [productSearch, setProductSearch] = useState("");
  const [productActive, setProductActive] = useState<"all" | "true" | "false">("all");
  const [faqSearch, setFaqSearch] = useState("");
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

  const shopQuery = useQuery({
    queryKey: ["shop-detail", shopId],
    queryFn: () => shopsService.detail(shopId),
    enabled: !!shopId,
  });

  const productsQuery = useQuery({
    queryKey: ["shop-products", shopId, productSearch, productActive],
    queryFn: () =>
      productsService.list({
        shopId,
        limit: 100,
        search: productSearch || undefined,
        isActive: productActive === "all" ? undefined : productActive === "true",
      }),
    enabled: !!shopId,
  });

  const faqsQuery = useQuery({
    queryKey: ["shop-faqs", shopId, faqSearch],
    queryFn: () =>
      faqsService.list({
        shopId,
        limit: 100,
        search: faqSearch || undefined,
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
      await queryClient.invalidateQueries({ queryKey: ["shop-faqs", shopId] });
      setFaqDrawerOpen(false);
      faqForm.resetFields();
    },
  });

  const updateFaqMutation = useMutation({
    mutationFn: (payload: { id: string; data: { question?: string; answer?: string } }) =>
      faqsService.update(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shop-faqs", shopId] });
      setFaqDetailOpen(false);
      setCurrentFaq(null);
      faqDetailForm.resetFields();
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (id: string) => faqsService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shop-faqs", shopId] });
      setFaqDetailOpen(false);
      setCurrentFaq(null);
      faqDetailForm.resetFields();
    },
  });

  const deleteManyFaqsMutation = useMutation({
    mutationFn: (ids: string[]) => faqsService.deleteMany(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shop-faqs", shopId] });
      setSelectedFaqIds([]);
    },
  });

  return (
    <AuthGuard>
      <div className="p-4 md:p-6">
        <Card title={`Shop: ${shopQuery.data?.name ?? shopId}`}>
          <Tabs
            items={[
              {
                key: "products",
                label: "Products",
                children: (
                  <div>
                    <div className="mb-4 flex gap-3 items-center">
                      <Input.Search
                        allowClear
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products"
                      />
                      <Select
                        value={productActive}
                        onChange={setProductActive}
                        style={{ width: 180 }}
                        options={[
                          { value: "all", label: "All" },
                          { value: "true", label: "Active" },
                          { value: "false", label: "Inactive" },
                        ]}
                      />
                      <Button type="primary" onClick={() => setProductDrawerOpen(true)}>
                        Add products
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
                        Delete selected
                      </Button>
                    </div>
                    <Table<ProductItem>
                      rowKey="id"
                      dataSource={products}
                      pagination={false}
                      rowSelection={{
                        selectedRowKeys: selectedProductIds,
                        onChange: (keys) => setSelectedProductIds(keys as string[]),
                      }}
                      columns={[
                        { title: "Name", dataIndex: "name" },
                        { title: "Price", dataIndex: "price" },
                        { title: "Search Content", dataIndex: "searchContent" },
                        {
                          title: "Active",
                          dataIndex: "isActive",
                          render: (value: boolean) => (value ? "Yes" : "No"),
                        },
                        {
                          title: "Actions",
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
                              Detail
                            </Button>
                          ),
                        },
                      ]}
                    />
                  </div>
                ),
              },
              {
                key: "faqs",
                label: "FAQs",
                children: (
                  <div>
                    <div className="mb-4 flex gap-3 items-center">
                      <Input.Search
                        allowClear
                        value={faqSearch}
                        onChange={(e) => setFaqSearch(e.target.value)}
                        placeholder="Search FAQs"
                      />
                      <Button type="primary" onClick={() => setFaqDrawerOpen(true)}>
                        Add FAQs
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
                        Delete selected
                      </Button>
                    </div>
                    <Table<FaqItem>
                      rowKey="id"
                      dataSource={faqs}
                      pagination={false}
                      rowSelection={{
                        selectedRowKeys: selectedFaqIds,
                        onChange: (keys) => setSelectedFaqIds(keys as string[]),
                      }}
                      columns={[
                        { title: "Question", dataIndex: "question" },
                        { title: "Answer", dataIndex: "answer" },
                        {
                          title: "Actions",
                          key: "actions",
                          render: (_, faq) => (
                            <Button
                              size="small"
                              onClick={() => {
                                setCurrentFaq(faq);
                                faqDetailForm.setFieldsValue({
                                  question: faq.question,
                                  answer: faq.answer,
                                });
                                setFaqDetailOpen(true);
                              }}
                            >
                              Detail
                            </Button>
                          ),
                        },
                      ]}
                    />
                  </div>
                ),
              },
            ]}
          />
        </Card>

        <Drawer
          title="Add products"
          placement="left"
          width={480}
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
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {fields.map((field, index) => (
                      <Card
                        key={field.key}
                        size="small"
                        title={`Product ${index + 1}`}
                        extra={
                          fields.length > 1 ? (
                            <Button size="small" danger onClick={() => remove(field.name)}>
                              Remove
                            </Button>
                          ) : null
                        }
                      >
                        <Form.Item
                          label="Name"
                          name={[field.name, "name"]}
                          rules={[{ required: true, message: "Name is required" }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label="Price"
                          name={[field.name, "price"]}
                          rules={[{ required: true, message: "Price is required" }]}
                        >
                          <Input type="number" min={0} />
                        </Form.Item>
                        <Form.Item label="Thumbnail URL" name={[field.name, "thumbnailUrl"]}>
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label="Image URLs (comma separated)"
                          name={[field.name, "imageUrlsText"]}
                        >
                          <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item label="Search content" name={[field.name, "searchContent"]}>
                          <Input.TextArea rows={2} />
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
                        searchContent: "",
                        isActive: true,
                      })
                    }
                  >
                    Add another product
                  </Button>
                </>
              )}
            </Form.List>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setProductDrawerOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createProductsMutation.isPending}
              >
                Save
              </Button>
            </div>
          </Form>
        </Drawer>

        <Drawer
          title={
            currentProduct ? `Product detail: ${currentProduct.name}` : "Product detail"
          }
          placement="left"
          width={480}
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
              label="Name"
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: "Price is required" }]}
            >
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item label="Thumbnail URL" name="thumbnailUrl">
              <Input />
            </Form.Item>
            <Form.Item label="Image URLs (comma separated)" name="imageUrlsText">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item label="Search content" name="searchContent">
              <Input.TextArea rows={2} />
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
                Delete this product
              </Button>
              <Space>
                <Button
                  onClick={() => {
                    setProductDetailOpen(false);
                    setCurrentProduct(null);
                    productDetailForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateProductMutation.isPending}
                >
                  Save changes
                </Button>
              </Space>
            </div>
          </Form>
        </Drawer>

        <Drawer
          title="Add FAQs"
          placement="left"
          width={480}
          open={faqDrawerOpen}
          onClose={() => setFaqDrawerOpen(false)}
          destroyOnClose
        >
          <Form
            form={faqForm}
            layout="vertical"
            initialValues={{
              items: [{ question: "", answer: "" }],
            }}
            onFinish={(values: {
              items: {
                question: string;
                answer: string;
              }[];
            }) =>
              createFaqsMutation.mutate(
                values.items.map((item) => ({
                  shopId,
                  question: item.question,
                  answer: item.answer,
                })),
              )
            }
          >
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {fields.map((field, index) => (
                      <Card
                        key={field.key}
                        size="small"
                        title={`FAQ ${index + 1}`}
                        extra={
                          fields.length > 1 ? (
                            <Button size="small" danger onClick={() => remove(field.name)}>
                              Remove
                            </Button>
                          ) : null
                        }
                      >
                        <Form.Item
                          label="Question"
                          name={[field.name, "question"]}
                          rules={[{ required: true, message: "Question is required" }]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label="Answer"
                          name={[field.name, "answer"]}
                          rules={[{ required: true, message: "Answer is required" }]}
                        >
                          <Input.TextArea rows={3} />
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
                      })
                    }
                  >
                    Add another FAQ
                  </Button>
                </>
              )}
            </Form.List>
            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setFaqDrawerOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createFaqsMutation.isPending}
              >
                Save
              </Button>
            </div>
          </Form>
        </Drawer>

        <Drawer
          title={currentFaq ? `FAQ detail` : "FAQ detail"}
          placement="left"
          width={480}
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
            onFinish={(values: { question: string; answer: string }) => {
              if (!currentFaq) return;
              updateFaqMutation.mutate({
                id: currentFaq.id,
                data: {
                  question: values.question,
                  answer: values.answer,
                },
              });
            }}
          >
            <Form.Item
              label="Question"
              name="question"
              rules={[{ required: true, message: "Question is required" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Answer"
              name="answer"
              rules={[{ required: true, message: "Answer is required" }]}
            >
              <Input.TextArea rows={3} />
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
                Delete this FAQ
              </Button>
              <Space>
                <Button
                  onClick={() => {
                    setFaqDetailOpen(false);
                    setCurrentFaq(null);
                    faqDetailForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateFaqMutation.isPending}
                >
                  Save changes
                </Button>
              </Space>
            </div>
          </Form>
        </Drawer>
      </div>
    </AuthGuard>
  );
}
