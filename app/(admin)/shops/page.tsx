"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Drawer, Input, Select, Space, Switch, Form, Table } from "antd";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { shopsService, type ShopItem, type CreateShopInput } from "@/services/shops.service";

export default function ShopsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<"all" | "true" | "false">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentShop, setCurrentShop] = useState<ShopItem | null>(null);
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const listQuery = useQuery({
    queryKey: ["shops", search, isActive],
    queryFn: () =>
      shopsService.list({
        limit: 100,
        search: search || undefined,
        isActive: isActive === "all" ? undefined : isActive === "true",
      }),
  });

  const createMutation = useMutation({
    mutationFn: (items: CreateShopInput[]) => {
      if (!user?.id) {
        return Promise.reject(new Error("Missing authenticated user"));
      }
      return shopsService.createManyForUser(user.id, items);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shops"] });
      setCreateOpen(false);
      form.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: CreateShopInput }) =>
      shopsService.update(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shops"] });
      setDetailOpen(false);
      setCurrentShop(null);
      detailForm.resetFields();
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: (ids: string[]) => shopsService.deleteMany(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shops"] });
      setSelectedIds([]);
    },
  });

  const deleteOneMutation = useMutation({
    mutationFn: (id: string) => shopsService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["shops"] });
      setDetailOpen(false);
      setCurrentShop(null);
      detailForm.resetFields();
    },
  });

  const shops: ShopItem[] = listQuery.data ?? [];

  return (
    <AuthGuard>
      <div className="p-4 md:p-6">
        <Card
          title="Shops"
          extra={
            <Space>
              <Button
                danger
                disabled={!selectedIds.length}
                loading={deleteManyMutation.isPending}
                onClick={() => {
                  if (!selectedIds.length) return;
                  deleteManyMutation.mutate(selectedIds);
                }}
              >
                Delete selected
              </Button>
              <Button type="primary" onClick={() => setCreateOpen(true)}>
                Create shop
              </Button>
            </Space>
          }
        >
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
            <Input.Search
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shop name/description"
            />
            <Select
              value={isActive}
              onChange={setIsActive}
              style={{ width: 180 }}
              options={[
                { value: "all", label: "All" },
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
            />
          </div>

          <Table<ShopItem>
            rowKey="id"
            dataSource={shops}
            pagination={false}
            onRow={(record) => ({
              onClick: (event) => {
                const target = event.target as HTMLElement;
                if (target.closest("button, a, input, label")) {
                  return;
                }
                router.push(`/shops/${record.id}`);
              },
            })}
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys) => setSelectedIds(keys as string[]),
            }}
            columns={[
              {
                title: "Name",
                dataIndex: "name",
              },
              {
                title: "User ID",
                dataIndex: "userId",
              },
              {
                title: "Description",
                dataIndex: "description",
                render: (value?: string | null) =>
                  value || <span className="text-foreground/40">No description</span>,
              },
              {
                title: "Status",
                dataIndex: "isActive",
                render: (value: boolean) => (
                  <span className={value ? "text-green-600" : "text-red-500"}>
                    {value ? "Active" : "Inactive"}
                  </span>
                ),
              },
              {
                title: "Actions",
                key: "actions",
                render: (_, shop) => (
                  <Button
                    size="small"
                    onClick={() => {
                      setCurrentShop(shop);
                      detailForm.setFieldsValue({
                        name: shop.name,
                        description: shop.description || "",
                        isActive: shop.isActive,
                      });
                      setDetailOpen(true);
                    }}
                  >
                    Detail
                  </Button>
                ),
              },
            ]}
          />
        </Card>

        <Drawer
          title="Create shops"
          placement="right"
          width={480}
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              items: [{ name: "", description: "", isActive: true }],
            }}
            onFinish={(values: { items: CreateShopInput[] }) => {
              createMutation.mutate(values.items);
            }}
          >
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {fields.map((field, index) => (
                      <Card
                        key={field.key}
                        size="small"
                        title={`Shop ${index + 1}`}
                        extra={
                          fields.length > 1 ? (
                            <Button
                              size="small"
                              danger
                              onClick={() => remove(field.name)}
                            >
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
                        <Form.Item label="Description" name={[field.name, "description"]}>
                          <Input.TextArea rows={2} />
                        </Form.Item>
                        <Form.Item
                          label="Active"
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
                    onClick={() => add({ name: "", description: "", isActive: true })}
                  >
                    Add another shop
                  </Button>
                </>
              )}
            </Form.List>

            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending}
              >
                Create
              </Button>
            </div>
          </Form>
        </Drawer>

        <Drawer
          title={currentShop ? `Shop detail: ${currentShop.name}` : "Shop detail"}
          placement="right"
          width={480}
          open={detailOpen}
          onClose={() => {
            setDetailOpen(false);
            setCurrentShop(null);
            detailForm.resetFields();
          }}
          destroyOnClose
        >
          <Form
            form={detailForm}
            layout="vertical"
            onFinish={(values: CreateShopInput) => {
              if (!currentShop) return;
              updateMutation.mutate({
                id: currentShop.id,
                data: values,
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
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item label="Active" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>

            <div className="mt-6 flex justify-between gap-2">
              <Button
                danger
                loading={deleteOneMutation.isPending}
                onClick={() => {
                  if (!currentShop) return;
                  deleteOneMutation.mutate(currentShop.id);
                }}
              >
                Delete this shop
              </Button>
              <Space>
                <Button
                  onClick={() => {
                    setDetailOpen(false);
                    setCurrentShop(null);
                    detailForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={updateMutation.isPending}
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
